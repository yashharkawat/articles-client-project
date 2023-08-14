import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import readingTime from "../readingTime";
import SaveForLater from "../saved/SaveForLater";
import deleteImage from "../../images/delete.png";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../config/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { actions } from "../../store/index";
import { setRevisionHistory } from "../../actions/setRevisionHistory";
const Draft = (props) => {
  const [post, setPost] = useState(props.post);
  const postOnClick=()=>{
    
  }
  return (
    <div className="draft" id={post.id}>
      {post.image !== undefined && (
        <div onClick={postOnClick}>
          <img
            className="post-image margin-bottom pointer"
            src={post.image}
            alt="Featured"
          />
        </div>
      )}
      <div className="post-description">
        <p className="post-title pointer" onClick={postOnClick}>
          {post.title}
        </p>

        <div
          className="flex space-between margin-bottom pointer"
          onClick={postOnClick}
        >
          <div className="topic-time">
            {post.topic !== undefined && (
              <div className="post-topic">{post.topic}</div>
            )}
            <div className="pointer" onClick={()=>props.deletePost(post)}>
                <img src={deleteImage} alt="delete" />
              </div>
          </div>
        </div>
        <p className="post-title pointer" onClick={postOnClick}>
          {post.text}
        </p>
      </div>
      <button className="button" onClick={()=>props.addPost(post)}>Add post</button>
    </div>
  );
};

export default Draft;
