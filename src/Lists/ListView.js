import Share from "./Share";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { actions } from "../store";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
const ListView = ({handleDeleteList,list,lists,userList}) => {
    const [share,setShare]=useState(false);
    const handleShareList = () => {
        setShare(true);
      };
      const shareHandler=()=>{
        setShare(false);
      }
  return (
    <li key={list.id}>
      <Link to={`${list.id}`}>
        {" "}
        <button>Add to List</button>
      </Link>

      {list.title}
      <button onClick={() => handleShareList()}>Share</button>
      <button onClick={() => handleDeleteList(list.id)}>Delete</button>

      {share && (
        <Share
          list={list}
          lists={lists}
          userList={userList}
          setShare={shareHandler}
        />
      )}
    </li>
  );
};
export default ListView;