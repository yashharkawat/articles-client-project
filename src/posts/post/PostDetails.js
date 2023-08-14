import React from "react";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import SimilarAuthor from "../recommendations/SimilarAuthor";
import RecommendedPosts from "../recommendations/RecommendedPosts";
import NavBar from "../navbar/NavBar";
import SaveForLater from "../saved/SaveForLater";
import Comment from "../Comment/Comment";
import { getDateString } from "./Post";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../store";
import readingTime from "../readingTime";

const PostDetails = () => {
  const params = useParams();
  const [post, setPost] = useState({});
  const [similar, setSimilar] = useState(true);
  const [readTime, setReadTime] = useState(0);
  const [following, setFollowing] = useState(false);
  const [like, setLike] = useState(false);
  const [comment, setComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.id);
  const [myPost, setMyPost] = useState(false);
  const username = useSelector((state) => state.name);
  const followingName = useSelector((state) => state.followers);
  const currUser = useSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (followingName !== undefined) {
      console.log("useEffect", followingName);
      if (followingName.includes(post.author)) {
        //console.log('author',post.author);
        setFollowing(true);
      }
    }
  }, [followingName, post.author]);

  const getArticles = async () => {
    setLoading(true);
    const articlesCollection = collection(db, "articles");
    const data = await getDocs(articlesCollection);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const filteredPost = filteredData.filter((data) => data.id === params.id);
    //console.log(filteredPost);
    const newData = filteredPost.map((item) => {
      if (item.liked_by === undefined && item.comments === undefined) {
        return { ...item, liked_by: [], comments: [] };
      } else if (item.liked_by === undefined) {
        return { ...item, liked_by: [] };
      } else if (item.comments === undefined) {
        return { ...item, comments: [] };
      } else return item;
    });
    setPost(newData[0]);
    //console.log(newData[0]);
    setLoading(false);
    const postDetails = newData[0];
    setReadTime(readingTime(postDetails.text));
    if (postDetails.liked_by.includes(userId)) {
      setLike(true);
    }
    if (postDetails.author === username) setMyPost(true);
  };

  useEffect(() => {
    try {
      getArticles();
    } catch (err) {
      console.log(err);
    }
  }, [params.id]);

  const likeHandler = async () => {
    setLike(true);
    const newLikes = [...post.liked_by, userId];
    const newPost = { ...post, liked_by: newLikes };
    setPost(newPost);
    //setPost(newPost);
    console.log(newPost);
    const currentPostRef = doc(db, "articles", post.id);
    await updateDoc(currentPostRef, newPost);
  };
  const unlikeHandler = async () => {
    setLike(false);
    const newLikes = post.liked_by.filter((user) => user !== userId);
    const newPost = { ...post, liked_by: newLikes };
    setPost(newPost);
    const currentPostRef = doc(db, "articles", post.id);
    await updateDoc(currentPostRef, newPost);
  };
  const follow = async () => {
    setFollowing(true);
    try {
      let newFollows = [];
      if (followingName === undefined) {
        newFollows.push(post.author);
      } else {
        newFollows = [post.author, ...currUser.followers];
      }
      dispatch(actions.changeCurrentUserFollowers(newFollows));
      console.log(currUser);
      const userRef = doc(db, "users", userId);
      const newUser = { ...currUser, followers: newFollows };
      await updateDoc(userRef, newUser);
    } catch (err) {
      console.log(err);
    }
  };
  const unfollow = async () => {
    setFollowing(false);
    try {
      const newFollows = currUser.followers.filter((item) => {
        console.log(item, post.author);
        return item !== post.author;
      });
      dispatch(actions.changeCurrentUserFollowers(newFollows));
      const userRef = doc(db, "users", userId);
      const newUser = { ...currUser, followers: newFollows };
      await updateDoc(userRef, newUser);
    } catch (err) {
      console.log(err);
    }
  };

  const closeCommentHandler = () => {
    setComment(false);
  };
  const addCommentHandler = (author, content) => {
    const comm = { author, content };
    const newComments = [comm, ...post.comments];
    setPost((prev) => {
      return { ...prev, comments: newComments };
    });
  };

  if (loading) return <div>Loading</div>;
  return (
    <>
      <div className="details-container">
        <h1>{post.title}</h1>

        <div className="flex">
          <p className="flex-item">Author: {post.author} </p>
          {!following && (
            <div className="flex-item pointer blue" onClick={follow}>
              Follow
            </div>
          )}
          {following && (
            <div className="flex-item pointer blue" onClick={unfollow}>
              Following
            </div>
          )}
        </div>
        <div className="flex space-between">
          <div>
            {post.topic !== undefined && (
              <span className="post-topic">{post.topic}</span>
            )}

            <span className="flex-item"> {`  ${readTime}`} min read</span>
          </div>
          <p className="flex-item">Date: {getDateString(post.created_at)}</p>
        </div>

        <div>
          <div className="flex space-between align pointer">
            <div className="flex align">
              {!like && (
                <svg
                  className="flex-item"
                  onClick={likeHandler}
                  color="rgb(120, 120, 120)"
                  fill="rgb(120, 120, 120)"
                  height="24"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <title>Like</title>
                  <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                </svg>
              )}
              {like && (
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
              <svg
                onClick={() => setComment(!comment)}
                className="flex-item"
                color="rgb(120, 120, 120)"
                fill="rgb(0, 0, 0)"
                height="24"
                role="img"
                viewBox="0 0 24 24"
                width="24"
              >
                <title>Comment</title>
                <path
                  d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-width="2"
                ></path>
              </svg>
              <span className="flex-item">{post.comments.length}</span>
            </div>
            <div className="navbar-right">
              <SaveForLater postId={post.id} />

              {myPost && (
                <Link to={`/edit/${post.id}`}>
                  <svg
                    className="flex-item"
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
                </Link>
              )}
            </div>

            {comment && (
              <Comment
                comments={post.comments}
                post={post}
                close={closeCommentHandler}
                addComment={addCommentHandler}
              />
            )}
          </div>
          <div className="flex-item">
            Viewed by {post.view === undefined ? 0 : post.view} people
          </div>
          <br />
          <br />
          <img
            src={post.image}
            style={{ width: "100%", height: "auto", maxHeight: "400px" }}
          />
          <br />
          <p>{post.text}</p>

          <br />
          <div className="flex space-between pointer">
            <span
              className={`blue ${similar ? "active" : ""}`}
              onClick={() => setSimilar(true)}
            >
              Similar posts{" "}
            </span>
            <span
              className={`blue ${!similar ? "active" : ""}`}
              onClick={() => setSimilar(false)}
            >
              Recommended posts
            </span>
          </div>

          <br />
        </div>
      </div>
      {similar && <SimilarAuthor author={post.author} id={post.id} />}
      {!similar && <RecommendedPosts topic={post.topic} id={post.id}/>}
    </>
  );
};

export default PostDetails;
