import Share from "./Share";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { actions } from "../store";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import './list.css'
const ListView = ({handleDeleteList,list,lists,userList}) => {
    const [share,setShare]=useState(false);
    const handleShareList = () => {
        setShare(true);
      };
      const shareHandler=()=>{
        setShare(false);
      }
  return (
    <div key={list.id} className="list">
      

      <h3>{list.title}</h3>
      <h4>Posts: </h4>
      <ul>
      {list.posts.map((post)=><li key={post.id}>{post.title}</li>)}
      </ul>
      <div className="flex">
      <Link to={`${list.id}`}>
        {" "}
        <button className="list-button">Add post</button>
      </Link>
      <button className="list-button" onClick={() => handleShareList()}>Share</button>
      <button className="list-button" onClick={() => handleDeleteList(list.id)}>Delete</button>

      </div>
      {share && (
        <Share
          list={list}
          lists={lists}
          userList={userList}
          setShare={shareHandler}
        />
      )}
      <h4>Shared with:</h4>
        <ul>{list.shared.map(item=><li>{item}</li>)}</ul>
         
    </div>
  );
};
export default ListView;