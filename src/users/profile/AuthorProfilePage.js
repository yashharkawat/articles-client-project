import { collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import { getDocs, doc } from "firebase/firestore";
import './AuthorProfilePage.css';
import SimilarAuthor from "../../posts/recommendations/SimilarAuthor";
const AuthorProfilePage = () => {
  const params = useParams();
  const [author, setAuthor] = useState({});
  useEffect(() => {
    const getData = async () => {
      const userRef = collection(db, "users");
      const data = await getDocs(userRef);
      const filterUsers = data.docs.map((item) => ({...item.data(),id:item.id}));
      //console.log(filterUsers);
      const user = filterUsers.filter((item) => {
        return (item.name === params.name);
      })[0];
      setAuthor(user);
      // console.log("params", params.name);
     // console.log(user);
    };
    try {
      getData();
    } catch (err) {
      console.log(err);
    }
  }, [params.name]);
  return (
    <>
      
    <div className="author-profile">
      <h2>{author.name}</h2>
      <p>Age: {author.age}</p>
      <p>Bio: {author.bio}</p>
      <p>Email: {author.email}</p>
    </div>
    <h2 style={{textAlign:"center"}}>Posts by a similar author</h2>
    <SimilarAuthor author={author.name}  />
    </>
  );
};

export default AuthorProfilePage;
