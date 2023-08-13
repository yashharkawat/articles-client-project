import React, { useState, useEffect } from "react";
import Post from "../post/Post";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { deletePostHandler } from "../../actions/deletePosthandler";
const BestPosts = () => {
  const [bestPosts, setbestPosts] = useState([]);
  const getArticles = async () => {
    const articlesCollection = collection(db, "articles");
    const data = await getDocs(articlesCollection);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const newData = filteredData.map((item) => {
      if (item.liked_by === undefined && item.comments === undefined) {
        return { ...item, liked_by: [], comments: [] };
      } else if (item.liked_by === undefined) {
        return { ...item, liked_by: [] };
      } else if (item.comments === undefined) {
        return { ...item, comments: [] };
      } else return item;
    });
    const posts=newData;
    const now = new Date(); // You can adjust the unit time as needed (e.g., 24 hours, 7 days, etc.)

      const postsWithAvgLikes = posts.map((post) => {
        const datetime = new Date(post.datetime);
        const timeDifferenceInHours = now - datetime;
        const avgLikes = post.likes / timeDifferenceInHours;
        return { ...post, avgLikes };
      });
      //console.log(postsWithAvgLikes);
      // Sort the posts based on the average likes per unit time in descending order
      postsWithAvgLikes.sort((a, b) => b.avgLikes - a.avgLikes);
      console.log(postsWithAvgLikes);
      setbestPosts(postsWithAvgLikes.slice(0,6));
  };

  useEffect(() => {
    try {
      getArticles();
    } catch (err) {
      console.log(err);
    }
  }, []);
  const handleDeletePost = async (postId) => {
    const filter = bestPosts.filter((post) => post.id !== postId);
    setbestPosts(filter);
    await deletePostHandler(postId);
  };
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Recommended Posts</h2>
      <div className="post-list">
        {bestPosts.map((post) => {
          return <Post post={post} deletePost={handleDeletePost} />;
        })}
      </div>
    </div>
  );
};

export default BestPosts;
