const { doc, addDoc, updateDoc, collection, initializeFirestore, increment, query, where, getDocs } = require('firebase/firestore');
const { ref, get, getDatabase }  = require('firebase/database');
const { initializeApp } = require('firebase/app');

const firebaseConfig = {
  authDomain: "soundglide-41873.firebaseapp.com",
  databaseURL: "https://soundglide-41873-default-rtdb.firebaseio.com",
  projectId: "soundglide-41873",
  storageBucket: "soundglide-41873.appspot.com",
  messagingSenderId: "1073449544316",
  appId: "1:1073449544316:web:42e7d4802247827c0ab7f9",
  measurementId: "G-7G6JDZW9VV"
};

const DB = {
  cards: "cards",
  users: "accounts",
  groups: "groups",
  seen_groups: "seen-groups",
  profile_pics: "profile-pics",
  messages: "messages",
  companies: "companies",
  businesses: "businesses",
  locations: "prod/locations",
  notif_token: "prod/notif_tokens"
};


const messages = {};

const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);
const firestore = initializeFirestore(firebase, {
  experimentalForceLongPolling: true
});



const getUserNotifToken = async (id) => {
  if(id?.length)
  {
    const snapshot =  await get(ref(database, `${DB.notif_token}/${id}`));
    if (snapshot?.exists())
    {
      const val = snapshot?.val();
      return val?.token || '';
    }
  }
  return '';
}

const getAllEmployees = async (company_id) => {
  const q = await query(
    collection(firestore, DB.users),
    where("company", "==", company_id)
  );
  const snapshot = await getDocs(q);
  const users = snapshot?.docs?.map(doc => doc?.data());
  return users || [];
}

const notifyEmployees = async (company_id, body_text, data) => {
  if(!company_id || !data)
  {
    console.log("notifyEmployees: invalid company id or data");
    return;
  }
  const users = await getAllEmployees(company_id);
  const promises = [];
  for(var i = 0; i < users?.length; i++)
  {
    if(!users[i]?.id)
      console.log("notifyEmployees: invalid employee account", users[i]);
    else
      promises.push(getUserNotifToken(users[i]?.id));
  }
  const tokens = await Promise.all(promises);
  console.log("notifyEmployees: notifying employees with tokens", tokens);
}

const sendMessageToAdmin = async (_id, createdAt, text, user, group_id, company_id = '', quickReplies = null, cipher = null) => {
  if(!user?._id)
    return;
  if(!_id)
  {
    console.log("sendMessage: id is null: " + _id);
    return;
  }
  if(!group_id)
  {
    console.log("sendMessage: group not found");
    return;
  }
  _id = _id.toString();
  group_id = group_id.toString();
  text = text?.toString()?.trim();
  console.log("-> sendMessage: Sending message by user:", user?._id, "to group:", group_id);
  
  // Some namings were changed to simplify integrating the Gifted Chat library
  const data = {
    _id: _id,
    group_id: group_id,
    sent_at: Date.parse(createdAt),
    createdAt: createdAt,
    sender_id: user?._id,
    text: text,
    user: user,
  };
  if(quickReplies)
    data["quickReplies"] = quickReplies;
  if(cipher)
    data["cipher"] = cipher;
  const name = "getCurrentAuthUser()?.displayName";
  const my_name = name?.length ? `${name}: ` : '';
  const body_text = `${my_name}${text}`;
  try
  {
    const promises = [
      addDoc(collection(collection(firestore, DB.messages), group_id, DB.messages), data),
      updateDoc(doc(firestore, DB.groups, group_id), {
        recent_text: text,
        recent_text_sent_at: Date.parse(createdAt),
        recent_text_sender_id: user?._id,
        total_messages: increment(1)
      }),
      notifyEmployees(company_id, body_text, data)
    ];
    await Promise.all(promises);
  }
  catch(e)
  {
    console.log(e);
  }
  if(messages[group_id]?.length && !messages[group_id]?.find(obj => obj?._id === data?._id))
  {
    messages[group_id] = [data, ...messages[group_id]];
  }
  return data;
}

module.exports = { sendMessageToAdmin };

// (async () => {
//   await sendMessage(
//     "1q1q1q1q1q1q1q1q1q1q1q1q1q1q1q1q1",
//     173802000,
//     "Hello, David~~~~",
//     {
//       _id: "1q1q1q1q1q1q1q1q1q1q1q1q1q1q1q1q1",
//       name: "1w1w1w1w1w1w1w1w1w1w1w1w1w1w1w1w",
//     },
//     "Zyu5DWwkmWA4f335T4Z6",
//     "qxBI110QaIiaQIffistj"
//   );
// })();
