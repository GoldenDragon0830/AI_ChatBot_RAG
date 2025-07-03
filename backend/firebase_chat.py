from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import time
import uuid
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Initialize Firebase Admin SDK
# You'll need to download your service account key from Firebase Console
# and replace 'path/to/serviceAccountKey.json' with the actual path
cred = credentials.Certificate("./soundglide-41873-firebase-adminsdk-c3jid-aeacf8f9bc.json")
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],  # or ["POST", "OPTIONS"]
    allow_headers=["*"],
)

class UserInfo(BaseModel):
    id_: str = Field(..., alias="_id")
    name: str

# Pydantic models for request/response
class CreateGroupRequest(BaseModel):
    business_id: str
    company_id: str
    user_id: str
    initial_message: str = ""

class SendMessageRequest(BaseModel):
    id_: str = Field(..., alias="_id")
    createdAt: str
    text: str
    user: UserInfo
    group_id: str

class User(BaseModel):
    _id: str
    name: Optional[str] = None
    email: Optional[str] = None
class GetGroupCompanyRequest(BaseModel):
    company_id: str
    user_id: str
class GetMessagesRequest(BaseModel):
    group_id: str

# Helper function to generate a new group ID
def new_group_id() -> str:
    """Generate a new group ID using Firestore auto-generated ID"""
    doc_ref = db.collection('groups').document()
    return doc_ref.id

@app.post("/groups")
async def create_group(request: CreateGroupRequest):
    """Create a new group"""
    
    # print("request: ", request)
    try:
        group_id = new_group_id()
        current_time = int(time.time() * 1000)  # Current timestamp in milliseconds
        print("group_id: ", group_id)
        
        data = {
            'id': group_id,
            'user_id': request.user_id,
            'group_id': group_id,
            'company_id': request.company_id,
            'business_id': request.business_id,
            'recent_text': request.initial_message,
            'recent_text_sent_at': current_time,
            'recent_text_sender_id': request.user_id,
            'total_messages': 0,
            'created': current_time
        }
        print("data: ", data)
        # Save to Firestore
        db.collection('groups').document(group_id).set(data)
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating group: {str(e)}")

@app.get("/groups/by-company")
async def get_group_by_company(
    company_id: str = Query(...),
    user_id: str = Query(...)
):
    """Get group by company ID and user ID"""
    print("company_id:", company_id, "user_id:", user_id)
    if not user_id or not company_id:
        return None
    try:
        groups_ref = db.collection('groups')
        query = groups_ref.where('user_id', '==', user_id).where('company_id', '==', company_id)
        docs = query.stream()
        for doc in docs:
            return doc.to_dict()
        print("No group found for the provided company and user id")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching group: {str(e)}")

@app.get("/messages/{group_id}")
async def get_messages(group_id: str):
    """Fetch all messages from a group"""
    if not group_id:
        return []
    try:
        # Query messages subcollection
        messages_ref = db.collection('messages').document(group_id).collection('messages')
        query = messages_ref.order_by('sent_at', direction=firestore.Query.ASCENDING)
        docs = query.stream()
        messages = []
        for doc in docs:
            messages.append(doc.to_dict())
        return messages
    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        return []

@app.post("/messages")
async def send_message(request: SendMessageRequest):
    """Send a message to a group"""
    if not request.user.id_:
        raise HTTPException(status_code=400, detail="User ID is required")
    if not request.id_:
        raise HTTPException(status_code=400, detail="Message ID is required")
    if not request.group_id:
        raise HTTPException(status_code=400, detail="Group ID is required")
    try:
        group_id = str(request.group_id)
        text = str(request.text).strip() if request.text else ""
        # Parse the createdAt timestamp
        try:
            # Try to parse as ISO format first
            created_at_dt = datetime.fromisoformat(request.createdAt.replace('Z', '+00:00'))
            sent_at = int(created_at_dt.timestamp() * 1000)
        except:
            # If that fails, try to parse as timestamp
            try:
                sent_at = int(float(request.createdAt))
            except:
                # If all else fails, use current time
                sent_at = int(time.time() * 1000)
        message_data = {
            '_id': str(request.id_),
            'group_id': group_id,
            'sent_at': sent_at,
            'createdAt': request.createdAt,
            'sender_id': request.user.id_,
            'text': text,
            'user': request.user.dict(by_alias=True)
        }
        # Create batch operation to update both message and group
        batch = db.batch()
        # Add message to messages subcollection
        message_ref = db.collection('messages').document(group_id).collection('messages').document()
        batch.set(message_ref, message_data)
        # Update group with recent message info
        group_ref = db.collection('groups').document(group_id)
        batch.update(group_ref, {
            'recent_text': text,
            'recent_text_sent_at': sent_at,
            'recent_text_sender_id': request.user.id_,
            'total_messages': firestore.Increment(1)
        })
        # Commit the batch
        batch.commit()
        return message_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

@app.get("/accounts/by-company/{company_id}")
async def get_account_by_company_id(company_id: str):
    """Get account by company ID"""
    if not company_id:
        return None
    
    try:
        # Query accounts collection
        accounts_ref = db.collection('accounts')
        query = accounts_ref.where('company', '==', company_id)
        docs = query.stream()
        
        # Return the first account found
        for doc in docs:
            return doc.to_dict()
        
        print("No account found for the provided company id")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching account: {str(e)}")

@app.get("/companies/{company_id}")
async def get_company_by_id(company_id: str):
    """Get company by ID"""
    if not company_id:
        return None
    
    try:
        # Query companies collection
        companies_ref = db.collection('companies')
        query = companies_ref.where('id', '==', company_id)
        docs = query.stream()
        
        # Return the first company found
        for doc in docs:
            return doc.to_dict()
        
        print("No company found for the provided company id")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching company: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)