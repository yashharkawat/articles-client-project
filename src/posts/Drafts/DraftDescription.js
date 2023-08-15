import React from "react";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import readingTime from "../readingTime";

const DraftDesription = () => {
  const params = useParams();
  const [post, setPost] = useState({});
  const [readTime, setReadTime] = useState(0);

  const currUser = useSelector((state) => state);
  const getArticles = async () => {
    const drafts = currUser.drafts;
    const draft = drafts.filter((dd) => dd.id == params.id)[0];
    setPost(draft);
    setReadTime(readingTime(draft.text));
  };

  useEffect(() => {
    try {
      getArticles();
    } catch (err) {
      console.log(err);
    }
  }, [params.id]);

  return (
    <>
      <div className="details-container">
        <h1>{post.title}</h1>

        <div className="flex">
          <p className="flex-item">Author: {currUser.name} </p>
        </div>
        <div className="flex space-between">
          <div>
            {post.topic !== undefined && (
              <span className="post-topic">{post.topic}</span>
            )}

            <span className="flex-item"> {`  ${readTime}`} min read</span>
          </div>
        </div>

        <br />
        <br />
        <img
          src={post.image}
          style={{ width: "100%", height: "auto", maxHeight: "400px" }}
        />
        <br />
        <p>{post.text}</p>
      </div>
    </>
  );
};

export default DraftDesription;
