import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Post from "../posts/post/Post";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import AddPost from "./AddPost";
import { actions } from "../store";
import { db } from "../config/firebase";
import { updateDoc,doc } from "firebase/firestore";
const List = () => {
  console.log("here");
  const currUser = useSelector((state) => state);
  const params = useParams();
  const lists = useSelector((state) => state.lists);

  // const [lists,setLists]=useState(listsSelect);
  const [list, setList] = useState({});
  const [loading, setLoading] = useState(true);
  const [addPost, SetAddPost] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    setLoading(true);
    //console.log(params.id);
    const newList = lists.filter((ll) => ll.id == params.id)[0];
    //console.log("newList",newList);
    setList(newList);
    setLoading(false);
  }, [params.id]);
  const deletePostHandler = async (postId) => {
    const newLists = lists.map((list) => {
      if (list.id == params.id) {
        const newPosts = list.posts.filter((post) => post.id !== postId);
        const newList = { ...list, posts: newPosts };
        setList(newList);

        return newList;
      }
      return list;
    });
    dispatch(actions.changeCurrentUserLists(newLists));
    const userRef = doc(db, "users", currUser.id);
    const newUser = { ...currUser, lists: newLists };
    await updateDoc(userRef, newUser);
  };
  const addHandler = (val) => {
    SetAddPost(val);
  };
  if (loading) return <div>Loading</div>;
  return (
    <div>
      <h1>{list.title}</h1>

      <button onClick={() => SetAddPost(true)}>Add posts to list</button>
      {addPost && <AddPost listId={list.id} add={addHandler} />}
      <div className="posts">
        {list.posts.map((post) => (
          <Post post={post} deletePost={deletePostHandler} />
        ))}
      </div>
    </div>
  );
};
export default List;
