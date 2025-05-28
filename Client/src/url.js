const Base_Url = "http://13.53.182.243:5000/api";
const Socket_Endpoint = "http://13.53.182.243:5000";

const User_Signup = `${Base_Url}/user/register`;
const User_Login = `${Base_Url}/user/login`;
const User_Search = `${Base_Url}/user`;
const Chat_Create = `${Base_Url}/chat`;
const Chat_Fetch = `${Base_Url}/chat/fetch`;
const Chat_Group_Create = `${Base_Url}/chat/group`;
const Chat_Group_Rename = `${Base_Url}/chat/group/rename`;
const Chat_Group_Remove = `${Base_Url}/chat/group/remove`;
const Chat_Group_add = `${Base_Url}/chat/group/add`;
const Message_Create = `${Base_Url}/message`;
const Fetch_Message = `${Base_Url}/message`;

export {
  Socket_Endpoint,
  User_Signup,
  User_Login,
  User_Search,
  Chat_Create,
  Chat_Fetch,
  Chat_Group_Create,
  Chat_Group_Rename,
  Chat_Group_Remove,
  Chat_Group_add,
  Message_Create,
  Fetch_Message
};
