import React, { useEffect, useState } from "react";
import Post from "../post/Post";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, updateDoc ,doc,addDoc} from "firebase/firestore";
import { db } from "../../config/firebase";
import { deletePostHandler } from "../../actions/deletePosthandler";
import Draft from "./Draft";
import { actions } from "../../store";
import { setRevisionHistory } from "../../actions/setRevisionHistory";
const Drafts = () => {
  const [loading, setLoading] = useState(true);
  const dispatch=useDispatch();
  const draftPosts = useSelector((state) => state.drafts);
  //console.log(draftPosts);
  const currUser=useSelector(state=>state);
  const handleDeletePost=async(articleId)=>{
    const filter=draftPosts.filter(post=>articleId!==post.id);
    dispatch(actions.changeCurrentUserDrafts(filter));
    const userRef=doc(db,"users",currUser.id);
    const newUser={...currUser,drafts:filter};
    await updateDoc(userRef,newUser);
    //setdraftPosts(filter);
    //await deletePostHandler(postId);
  }
  const addPost=async(article)=>{

    const filter=draftPosts.filter(post=>article!==post);
    dispatch(actions.changeCurrentUserDrafts(filter));
    const userRef=doc(db,"users",currUser.id);
    const newUser={...currUser,drafts:filter};
    await updateDoc(userRef,newUser);

    const date = new Date();
    const articlesCollection = collection(db, "articles");
    await addDoc(articlesCollection, { ...article, created_at: date, author: currUser.name, view: 0 ,liked_by:[],comments:[]});
    setRevisionHistory(currUser.revisionHistory,dispatch,currUser,article.title,"added");
  
  }
  return (
    <div>
      <h1>Draft Posts</h1>
      <div className="post-list">
        {draftPosts.length===0&&<h3>You do not have any draft posts</h3>}
      {draftPosts.map((post) => {
        return <Draft deletePost={handleDeletePost} post={post} addPost={addPost}/>;
      })}
      </div>
    </div>
  );
};

export default Drafts;
