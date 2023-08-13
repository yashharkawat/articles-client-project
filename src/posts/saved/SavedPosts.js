import React, { useEffect, useState } from "react";
import Post from "../post/Post";
import { useSelector } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { deletePostHandler } from "../../actions/deletePosthandler";

const SavedPosts = () => {
  const [loading, setLoading] = useState(true);
  const savedPostsId = useSelector((state) => state.saved);
  console.log(savedPostsId)
  const [savedPosts, setSavedPosts] = useState([]);
  const getArticles = async () => {
    const articlesRef = collection(db, "articles");
    const articles = await getDocs(articlesRef);
    const data = articles.docs.map((article) => ({
      ...article.data(),
      id: article.id,
    }));
    const saved = data.filter((post) => savedPostsId.includes(post.id));
    console.log(saved);
    setSavedPosts(saved);
  };
  useEffect(() => {
    setLoading(true);
    try {
      getArticles();
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }, [savedPostsId]);
  const handleDeletePost=async(postId)=>{
    const filter=savedPosts.filter(post=>post.id!==postId);
    setSavedPosts(filter);
    await deletePostHandler(postId);
  }
  return (
    <div>
      <h1>Saved Posts</h1>
      <div className="post-list">
        {savedPosts.length===0&&<h3>You do not have any saved posts</h3>}
      {savedPosts.map((post) => {
        return <Post key={post.id} deletePost={handleDeletePost} post={post} />;
      })}
      </div>
    </div>
  );
};

export default SavedPosts;
