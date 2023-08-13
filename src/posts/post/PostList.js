import React from "react";
import Post, { getDateString } from "./Post";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { getDocs, collection, doc, deleteDoc } from "firebase/firestore";

const PostList = (props) => {
  const [posts, setPosts] = useState([]);
  const [searchPosts, setSearchPosts] = useState([]);
  const articlesCollection = collection(db, "articles");
  const getArticles = async () => {
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
    setPosts(newData);
    setSearchPosts(newData);
    //console.log(newData);
  };
  useEffect(() => {
    try {
      getArticles();
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    //console.log(props.searchText, posts);
    if (props.searchText !== undefined && props.filter !== undefined) {
      const newSearchPosts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(props.searchText) ||
          post.author.toLowerCase().includes(props.searchText) ||
          post.topic.toLowerCase().includes(props.searchText)
      );

      let filterPosts = newSearchPosts.filter((post) => {
        if (props.filter.author === "") return true;
        return post.author
          .toLowerCase()
          .includes(props.filter.author.toLowerCase());
      });
      filterPosts = filterPosts.filter((post) => {
        if (props.filter.date === "") return true;

        return props.filter.date === getDateString(post.created_at);
      });
      filterPosts = filterPosts.filter((post) => {
        if (props.filter.likes === "") return true;
        return props.filter.likes <= post.liked_by.length;
      });
      filterPosts = filterPosts.filter((post) => {
        if (props.filter.comments === "") return true;
        return props.filter.comments <= post.comments.length;
      });
      //console.log("search", searchPosts);
      setSearchPosts(filterPosts);
    }
  }, [props.filter, props.searchText]);
  const deletePostHandler = async (postId) => {
    const articleDoc = doc(db, "articles", postId);
    const filterPosts = posts.filter((post) => post.id != postId);
    setPosts(filterPosts);
    await deleteDoc(articleDoc);
    try {
      getArticles();
    } catch (err) {}
  };

  return (
    <div className="post-list">
      {searchPosts.map((post) => (
        <Post key={post.id} post={post} deletePost={deletePostHandler} />
      ))}
    </div>
  );
};

export default PostList;
