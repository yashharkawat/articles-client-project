import PostList from "../post/PostList";
import NavBar from "../navbar/NavBar";
import { useEffect, useState } from "react";
import "./Display.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import TopicListPage from "../Topics/TopicList";
import BestPosts from "../recommendations/BestPosts";
import { collection, getDocs, updateDoc,doc } from "firebase/firestore";
import {db} from '../../config/firebase'
const Display = () => {
  // const user=useSelector(state=>state);
  // console.log("user",user);
  
  const [search, setSearch] = useState("");
  const [allPosts, setAllPosts] = useState(true);
  const [filter, setFilter] = useState({
    author: "",
    date: "",
    likes: "",
    comments: "",
  });
  const [topics, setTopics] = useState(false);
  const filterHandler = (filterValues) => {
    setFilter(filterValues);
    //console.log(filterValues);
  };
  const id = useSelector((state) => state.id);
  console.log(id);
  const searchHandler = (e) => {
    setSearch(e.target.value);
  };
  const topicHandler = (val) => {
    setTopics(val);
  };
  return (
    <div className="display-container">
      <NavBar />
      <div className="flex space-between margin-top">
        <input
          onChange={searchHandler}
          placeholder="Search posts"
          className="search-input"
          type="text"
          value={search}
        ></input>
      </div>
      <TopicListPage active={topicHandler} sendFilter={filterHandler} />
      {!topics && (
        <div className="flex center">
          <span
            className={`pages ${allPosts && "active"}`}
            onClick={() => setAllPosts(true)}
          >
            All Posts
          </span>
          <span
            to="/best-posts"
            className={`pages ${!allPosts && "active"}`}
            onClick={() => setAllPosts(false)}
          >
            Top Posts
          </span>
        </div>
      )}
      {!topics && allPosts && <PostList searchText={search} filter={filter} />}
      {!topics && !allPosts && <BestPosts />}
    </div>
  );
};
export default Display;




// const updateUser = async (user) => {
//   const userRef = doc(db, "users", user.id);
//   const newUser = { ...user, lists: [] };
//   await updateDoc(userRef, newUser);
// };
// useEffect(() => {
//   const update = async () => {
//     const usersRef = collection(db, "users");
//     const users = await getDocs(usersRef);
//     const data = users.docs.map((item) => ({ ...item.data(), id: item.id }));
//     data.forEach((user) => {
//       updateUser(user);
//     });
//   };
//   update();
// }, []);