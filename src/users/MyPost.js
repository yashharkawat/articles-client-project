import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";
import Post from "../posts/post/Post";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { deletePostHandler } from "../actions/deletePosthandler";
const MyPost = () => {
  const [posts, setPosts] = useState([]);
  const username = useSelector((state) => state.name);
  const getArticles = async () => {
    const articlesCollection = collection(db, "articles");
    const data = await getDocs(articlesCollection);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const mypost = filteredData.filter((post) => post.author === username);
    const newData = mypost.map((item) => {
      if (item.liked_by === undefined && item.comments === undefined) {
        return { ...item, liked_by: [], comments: [] };
      } else if (item.liked_by === undefined) {
        return { ...item, liked_by: [] };
      } else if (item.comments === undefined) {
        return { ...item, comments: [] };
      } else return item;
    });
    setPosts(newData);
    //console.log(newData);
  };
  useEffect(() => {
    try {
      getArticles();
    } catch (err) {
      console.log(err);
    }
  }, []);

  const handleDelete=async(postId)=>{
    const filter=posts.filter(post=>post.id!==postId);
    setPosts(filter);
    await deletePostHandler(postId);
  }
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>My posts</h2>
      <div className="post-list">
        {posts.map((post) => (
          <Post key={post.id} post={post} deletePost={handleDelete} />
        ))}
      </div>
      {posts.length === 0 && (
        <h4 style={{ textAlign: "center" }}>You haven't added any posts</h4>
      )}
    </div>
  );
};
export default MyPost;
