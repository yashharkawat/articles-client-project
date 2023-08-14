import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { actions } from "../store";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { useEffect,useState } from "react";
const Share = ({ userList, list, lists, setShare }) => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const getUsers = async () => {
      const usersRef = collection(db, "users");
      const users = await getDocs(usersRef);
      const username = users.docs.map((item) => ({
        ...item.data(),
        id: item.id,
      }));
      //console.log(username);
      //const filterUser = username.filter((user) => user !== currUser.name);
      setUsers(username);
    };
    getUsers();
  }, []);
  const dispatch = useDispatch();
  const currUser = useSelector((state) => state);
  const handleUserToggle = async (username, list) => {
    if (list.shared.includes(username)) {
      const shared = list.shared.filter((user) => user !== username);
      const newList = { ...list, shared: shared };
      const newLists = lists.map((ll) => {
        if (ll.id == list.id) {
          return newList;
        }
        return ll;
      });
      dispatch(actions.changeCurrentUserLists(newLists));
      const userRef = doc(db, "users", currUser.id);
      const newUser = { ...currUser, lists: newLists };
      await updateDoc(userRef, newUser);
    } else {
      const shared = [...list.shared, username];
      const newList = { ...list, shared: shared };
      const newusers = users.filter((item) => shared.includes(item.name));
      const promises = newusers.forEach(async (user) => {
        const userRef = doc(db, "users", user.id);
        const filterLists = user.lists.filter((item) => item !== list);
        const newLists = [...filterLists, list];
        const newUser = { ...user, lists: newLists };
        await updateDoc(userRef, newUser);
      });
      const newLists = lists.map((ll) => {
        if (ll.id == list.id) {
          return newList;
        }
        return ll;
      });
      dispatch(actions.changeCurrentUserLists(newLists));
      const userRef = doc(db, "users", currUser.id);
      const newUser = { ...currUser, lists: newLists };
      await updateDoc(userRef, newUser);
    }
  };

  return (
    <div className="share-popup">
      <h2>Share List</h2>
      <ul>
        {userList.map((user) => (
          <li key={user}>
            <label>
              <input
                type="checkbox"
                checked={list.shared.includes(user)}
                onChange={() => handleUserToggle(user, list)}
              />
              {user}
            </label>
          </li>
        ))}
      </ul>
      <button className="list-button" onClick={() => setShare(false)}>Share</button>
    </div>
  );
};
export default Share;
