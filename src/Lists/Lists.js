import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { actions } from "../store";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { updateDoc } from "firebase/firestore";
import ListView from "./ListView";
import { doc } from "firebase/firestore";
const Lists = () => {
  const lists = useSelector((state) => state.lists);
  console.log(lists);
  const [selectedListId, setSelectedListId] = useState(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [share, setShare] = useState(false);
  const dispatch = useDispatch();
  const [userList, setUserList] = useState([]);
  const currUser = useSelector((state) => state);
  useEffect(() => {
    const getUsers = async () => {
      const usersRef = collection(db, "users");
      const users = await getDocs(usersRef);
      const username = users.docs.map((item) => item.data().name);
      //console.log(username);
      const filterUser = username.filter((user) => user !== currUser.name);
      setUserList(filterUser);
    };
    getUsers();
  }, []);
  const handleAddList = async () => {
    if (newListTitle) {
      const newList = {
        id: Date.now(),
        title: newListTitle,
        posts: [],
        shared: [],
      };
      const ll = [...lists, newList];
      dispatch(actions.changeCurrentUserLists(ll));
      const userRef = doc(db, "users", currUser.id);
      const newUser = { ...currUser, lists: ll };
      await updateDoc(userRef, newUser);
      setNewListTitle("");
    }
  };

  const handleDeleteList = async(listId) => {
    const updatedLists = lists.filter((list) => list.id !== listId);
    dispatch(actions.changeCurrentUserLists(updatedLists));
    const userRef=doc(db,"users",currUser.id);
    const newUser={...currUser,lists:updatedLists};
    await updateDoc(userRef,newUser);
};

  const shareHandler = (val) => {
    setShare(val);
  };
  return (
    <div>
      <h1>List Page</h1>

      <h2>Create New List</h2>
      <input
        type="text" className="list-input"
        placeholder="Enter list title"
        value={newListTitle}
        onChange={(e) => setNewListTitle(e.target.value)}
      />
      <button className="list-button" onClick={handleAddList}>Create List</button>

      <h2>Lists</h2>
      <ul>
        {lists.map((list) => (
          <ListView
            handleDeleteList={handleDeleteList}
            list={list}
            lists={lists}
            userList={userList}
          />
        ))}
      </ul>
    </div>
  );
};

export default Lists;
