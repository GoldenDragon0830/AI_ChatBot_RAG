import firebase_admin
from firebase_admin import credentials, firestore
import time

# Initialize Firebase Admin SDK
cred = credentials.Certificate("./soundglide-41873-firebase-adminsdk-c3jid-b0c2181b8f.json")  # Use your own credentials
firebase_admin.initialize_app(cred)

db = firestore.client()

# Firestore Collections
DB = {
    "cards": "cards",
    "users": "accounts",
    "groups": "groups",
    "seen_groups": "seen-groups",
    "profile_pics": "profile-pics",
    "messages": "messages",
    "companies": "companies",
    "businesses": "businesses",
    "locations": "prod/locations",
    "notif_token": "prod/notif_tokens"
}

# Caching dictionaries
messages = {}
group_chats = {}
getMessageLastFetched = {}
messagesLastVisible = {}

# Function to get user by email
# def get_data_by_field(collection_name, field_name, value):
#     if not value:
#         return None
#     query_ref = db.collection(collection_name).where(field_name, "==", value)
#     docs = query_ref.get()
    
#     results = [doc.to_dict() for doc in docs]
#     return results[0] if results else None

def get_data_by_field(collection_name, field_name, value):
    if not value:
        return None
    query_ref = db.collection(collection_name).where(filter=firestore.FieldFilter(field_name, "==", value))
    docs = query_ref.get()

    results = [doc.to_dict() for doc in docs]
    return results[0] if results else None

def get_user_by_email(email):
    return get_data_by_field(DB["users"], "email", email)

def get_all_employees(company_id):
    # query_ref = db.collection(DB["users"]).where("company", "==", company_id)
    query_ref = db.collection(DB["users"]).where(filter=firestore.FieldFilter("company", "==", company_id))
    docs = query_ref.get()
    return [doc.to_dict() for doc in docs]

def format_card_details(msg):
    if msg.get("cipher") and msg.get("text") == "CARD_INFO_HEADER":
        card = decrypt_card(msg["cipher"], msg["user"]["_id"])
        msg["text"] = f"""CARD_INFO_HEADER\n\n
        Card Number: {card.get('number', '')}\n
        Expiration: {card.get('month', '')} / {card.get('year', '')}\n
        CVV: {card.get('cvv', '')}\n\n
        Phone Number: {card.get('phone_number', '')}\n
        {'In-store pick up: yes' if card.get('pick_up') else 'Delivery Address: ' + card.get('address', '')}"""


def create_group(user_id):
    group_id = db.collection(DB["groups"]).document().id

    data = {
        "id": group_id,
        "user_id": user_id,
        "group_id": group_id,
        "company_id": "qxBI110QaIiaQIffistj",
        "business_id": "Zyu5DWwkmWA4f335T4Z6",
        "recent_text": "",
        "recent_text_sent_at": int(time.time() * 1000),
        "recent_text_sender_id": "",
        "total_messages": 0,
        "created": int(time.time() * 1000)
    }

    result = db.collection(DB["groups"]).add(data)

    print("create_group---result--->", result)
    return data

def create_user(email):
    id = db.collection(DB["users"]).document().id

    data = {
        "id": id,
        "uid": id,
        "email": email,
        "displayName": "tester",
        "emailVerified": False,
        "lastLoggedIn": int(time.time() * 1000),
        "created": int(time.time() * 1000),
        "type":  "user",
        "company": ""
    }
    result = db.collection(DB["users"]).add(data)

    print("create_user---result--->", result)
    return data

# Login Function
def login_user(email_address):
    if not email_address:
        print("login: Invalid email address provided.")
        return

    email_address = str(email_address).strip()
    user = get_user_by_email(email_address)
    print("login_user---user-->", user)

    if user:
        group_data = get_data_by_field(DB["groups"], "user_id", user["id"])
        print("login_user---group_data-->", group_data)

        if group_data:
            result = {
                "id": user["id"],
                "email": user["email"],
                "displayName": user["displayName"],
                "type":  "user",
                "group_id": group_data["group_id"],
                "company": group_data["company_id"],
            }
            return result
        else:
            result = {
                "id": user["id"],
                "email": user["email"],
                "displayName": user["displayName"],
                "type":  "user",
                "group_id": "",
                "company": "",
            }
            return result
    
    else:
        user_data = create_user(email_address)
        # print("login_user---user_data-->", user_data["id"])
        group_data = create_group(user_data["id"])
        # print("login_user---group_data-->", group_data)

        result = {
            "id": user_data["id"],
            "email": user_data["email"],
            "displayName": user_data["displayName"],
            "type":  "user",
            "group_id": group_data["group_id"],
            "company": group_data["company_id"],
        }
        return result

# Get Group by ID
def get_group_by_id(group_id):
    if not group_id:
        print("getGroupByID: Invalid group id provided.")
        return None

    group_id = str(group_id)
    if group_id in group_chats:
        print(f'getGroupById: retrieving from cache {group_id}')
        return group_chats[group_id]

    doc_ref = db.collection(DB["groups"]).document(group_id).get()
    if doc_ref.exists:
        group_chats[group_id] = doc_ref.to_dict()
        return group_chats[group_id]
    return None

# Send Message Function
def send_message(message_id, created_at, text, user, group_id, company_id='', quick_replies=None, cipher=None):
    if not user.get("_id"):
        return
    if not message_id:
        print(f"sendMessage: id is null: {message_id}")
        return
    if not group_id:
        print("sendMessage: group not found")
        return

    message_id, group_id = str(message_id), str(group_id)
    text = text.strip() if text else ""
    
    print(f"-> sendMessage: Sending message by user: {user['_id']} to group: {group_id}")

    data = {
        "_id": message_id,
        "group_id": group_id,
        "sent_at": int(time.time() * 1000),
        "createdAt": created_at,
        "sender_id": user["_id"],
        "text": text,
        "user": user,
    }
    
    if quick_replies:
        data["quickReplies"] = quick_replies
    if cipher:
        data["cipher"] = cipher

    displayName = user.get("displayName", "")
    my_name = f"{displayName}: " if displayName else ""
    body_text = f"{my_name}{text}"

    print("send_message---->", data)

    try:
        db.collection(DB["messages"]).document(group_id).collection(DB["messages"]).add(data)
        print("send_message--try-->", data)
        # Get the document reference first
        group_ref = db.collection(DB["groups"]).where("id", "==", group_id).get()
        if group_ref:
            group_ref[0].reference.update({
                "recent_text": text,
                "recent_text_sent_at": int(time.time() * 1000),
                "recent_text_sender_id": user["_id"],
                "total_messages": firestore.Increment(1)
            })
        print("db.collection(DB[--try-->", data)

        print("////////company_id//////", company_id)


        # Notify Employees or Customer
        if company_id:
            print("send_message--company_id-->", data)

            notify_employees(company_id, body_text, data)
        else:
            print("send_message--company_id-->", data)

            notify_customer(group_id, body_text, data)
    except Exception as e:
        print(e)

    # Cache messages
    if group_id in messages and not any(msg["_id"] == data["_id"] for msg in messages[group_id]):
        messages[group_id].insert(0, data)
    
    return data

# Get Messages from Firestore
def get_messages(group_id, last_visible=None):
    if not group_id:
        print("getMessages: Group ID is null.")
        return []

    group_id = str(group_id)
    last_fetched = getMessageLastFetched.get(group_id, 0)
    group = get_group_by_id(group_id)

    if not group:
        print("getMessages: Group is null")
        return []

    # Query Firestore
    ref = db.collection(DB["messages"]).document(group_id).collection(DB["messages"])
    if last_visible:
        q = ref.order_by("sent_at", direction=firestore.Query.DESCENDING).start_after(last_visible).limit(25)
    else:
        q = ref.order_by("sent_at", direction=firestore.Query.DESCENDING).limit(25)

    docs = q.get()
    out = []
    for doc in docs:
        obj = doc.to_dict()
        format_card_details(obj)
        print("get_messages--->", obj)
        print("/")
        # Error
        # obj["createdAt"] = obj["createdAt"].replace(tzinfo=None) if "createdAt" in obj else None
        out.append(obj)

    messages[group_id] = out
    getMessageLastFetched[group_id] = int(time.time() * 1000)
    
    return out

# Example Notification Functions (placeholders)
def notify_employees(company_id, body_text, data):
    print(f"Notifying employees of {company_id}: {body_text}")

def notify_customer(group_id, body_text, data):
    print(f"Notifying customer in group {group_id}: {body_text}")

# Export functions for use
if __name__ == "__main__":
    print("Python Firestore Implementation Ready!")
