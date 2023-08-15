import React, { useEffect, useState } from "react";
import "./Post.css";
import { Link, useNavigate } from "react-router-dom";
import readingTime from "../readingTime";
import SaveForLater from "../saved/SaveForLater";
import deleteImage from "../../images/delete.png";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../config/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { actions } from "../../store/index";
import { setRevisionHistory } from "../../actions/setRevisionHistory";

export const getDateString = (date) => {
  if (date === undefined || date === null) return "";
  //console.log(date);
  //date=valueOf(date);
  try {
    date = date.toDate();
    date = date.toLocaleString().split(",")[0];
  } catch (err) {}
  try {
    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Format the date string in the desired format
    date = `${year}-${month}-${day}`;
  } catch (err) {}
  return date;
};
const doReset = (time) => {
  const currentTimestamp = Date.now();
  const lastResetTimestamp = time;

  const timeDifference = currentTimestamp - lastResetTimestamp;
  const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

  if (timeDifference > twentyFourHoursInMilliseconds) {
    return true;
  } else {
    return false;
  }
};

const Post = (props, { deletePost }) => {
  const [post, setPost] = useState(props.post);
  const [like, setLike] = useState(false);
  const readTime = readingTime(post.text);
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const savedPostsId = useSelector((state) => state.saved);
  const [myPost, setMyPost] = useState(false);
  const username = useSelector((state) => state.name);
  const currUser = useSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.post.author === username) setMyPost(true);
  }, [props.post]);
  const postOnClick = async () => {
    try {
      const article = doc(db, "articles", post.id);
      const newPost = { ...post, view: post.view + 1 };
      await updateDoc(article, newPost);
    } catch (err) {
      console.log(err);
    }
    try {
      
      if (doReset(currUser.lastResetTime)) {
        const user = doc(db, "users", currUser.id);
        const num = 0;
        dispatch(actions.changeCurrentUserViews(num));
        const newUser = { ...currUser, numOfViewsToday: num };
        
        await updateDoc(user, newUser);
      }
      const user = doc(db, "users", currUser.id);
      const num = currUser.numOfViewsToday + 1;
      if (num > currUser.totalPostViews) {
        prompt(
          "You have reached the end for your post views. But a plan to view more"
        );
      } else {
        dispatch(actions.changeCurrentUserViews(num));
        const newUser = { ...currUser, numOfViewsToday: num };
        await updateDoc(user, newUser);
        setRevisionHistory(
          currUser.revisionHistory,
          dispatch,
          currUser,
          post.title,
          "viewed"
        );

        navigate(`/post-details/${post.id}`);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const userId = useSelector((state) => state.id);

  useEffect(() => {
    if (post.liked_by.includes(userId)) {
      setLike(true);
    }
  }, [userId]);

  // const userLike=()=>{
  //   post.liked_by.includes()
  // }
  const likeHandler = async () => {
    setLike(true);
    const newLikes = [...post.liked_by, userId];
    const newPost = { ...post, liked_by: newLikes };
    setPost(newPost);
    const currentPostRef = doc(db, "articles", post.id);
    await updateDoc(currentPostRef, newPost);
    setRevisionHistory(
      currUser.revisionHistory,
      dispatch,
      currUser,
      post.title,
      "liked"
    );
  };
  const unlikeHandler = async () => {
    setLike(false);
    const newLikes = post.liked_by.filter((user) => user !== userId);
    const newPost = { ...post, liked_by: newLikes };
    setPost(newPost);

    const currentPostRef = doc(db, "articles", post.id);
    await updateDoc(currentPostRef, newPost);
    setRevisionHistory(
      currUser.revisionHistory,
      dispatch,
      currUser,
      post.title,
      "removed like"
    );
  };
  const deleteHandler = () => {
    //console.log("hello");
    props.deletePost(post.id);
   // console.log('in post.js',post.id);
    setRevisionHistory(
      currUser.revisionHistory,
      dispatch,
      currUser,
      post.title,
      "deleted"
    );
  };
  return (
    <div className="post" id={post.id}>
      {post.image !== undefined && (
        <div onClick={postOnClick}>
          <img  className="post-image margin-bottom pointer" src={post.image} alt="Featured" />
        </div>
      )}
      <div className="post-description">
      <div className="author-date" >
        <Link to={`/authors/${post.author}`} className="author">
          <p className="post-author">Author: {post.author}</p>
        </Link>
        <p className="post-datetime">{getDateString(post.created_at)}</p>
      </div>
      <p className="post-title pointer" onClick={postOnClick}>
        {post.title}
      </p>

      <div className="flex space-between margin-bottom pointer" onClick={postOnClick}>
        <div className="topic-time">
          {post.topic !== undefined && (
            <div className="post-topic">{post.topic}</div>
          )}
          <div> {`  ${readTime}`} min read</div>
        </div>
      </div>
      <div className="flex space-between margin-bottom">
        {
          props.draft===undefined&&<div className="flex-item align flex pointer">
          {!like && (
            <svg
              className="flex-item "
              onClick={likeHandler}
              color="white"
              fill="white"
              height="24"
              role="img"
              viewBox="0 0 24 24"
              width="24"
              
            >
              <title>Like</title>
              <path  d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
            </svg>
          )}
          {like &&(
            <svg
              className="flex-item"
              onClick={unlikeHandler}
              aria-label="Unlike"
              color="rgb(255, 48, 64)"
              fill="rgb(255, 48, 64)"
              height="24"
              role="img"
              viewBox="0 0 48 48"
              width="24"
            >
              <title>Unlike</title>
              <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
            </svg>
          )}
          <span className="flex-item">{post.liked_by.length}</span>
        </div>
        }
        {<div className="navbar-right">
          {props.draft===undefined&&<SaveForLater postId={post.id} title={post.title} />}
          {myPost && (
            
            <>
              {props.draft===undefined&&<Link to={`/edit/${post.id}`} className="flex-item">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-label="Write"
                >
                  <path
                    d="M14 4a.5.5 0 0 0 0-1v1zm7 6a.5.5 0 0 0-1 0h1zm-7-7H4v1h10V3zM3 4v16h1V4H3zm1 17h16v-1H4v1zm17-1V10h-1v10h1zm-1 1a1 1 0 0 0 1-1h-1v1zM3 20a1 1 0 0 0 1 1v-1H3zM4 3a1 1 0 0 0-1 1h1V3z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M17.5 4.5l-8.46 8.46a.25.25 0 0 0-.06.1l-.82 2.47c-.07.2.12.38.31.31l2.47-.82a.25.25 0 0 0 .1-.06L19.5 6.5m-2-2l2.32-2.32c.1-.1.26-.1.36 0l1.64 1.64c.1.1.1.26 0 .36L19.5 6.5m-2-2l2 2"
                    stroke="currentColor"
                  ></path>
                </svg>
              </Link>}
              <div className="pointer" onClick={deleteHandler}>
                <img src={deleteImage} alt="delete" />
              </div>
            </>
          )}
        </div>}
      </div>
      {
        props.draft===undefined&&<div >
        Viewed by {post.view === undefined ? 0 : post.view} people
      </div>
      }
      </div>
    </div>
  );
};

export default Post;
