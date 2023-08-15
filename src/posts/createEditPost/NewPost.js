import React, { useEffect, useState } from "react";
import { Formik, ErrorMessage } from "formik";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import "./NewPost.css";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "../../store";
import { setRevisionHistory } from "../../actions/setRevisionHistory";
async function checkUrlExists(url) {
  try {
    if (url.includes("http://")) return true;
    const response = await fetch(url);
    const data = response.json();
    //console.log(data);
    if (data.url.includes("http://localhost")) return false;
    return true; // Returns true for 2xx status codes
  } catch (error) {
    return false; // Catch network errors or failed requests
  }
}
const NewPost = (props) => {
  //const [loading,setLoading]=useState(true);
  const username = useSelector((state) => state.name);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(true);
  const revisionHistory = useSelector((state) => state.revisionHistory);
  const user = useSelector((state) => state);
  const dispatch = useDispatch();
  const currUser = useSelector((state) => state);
  const drafts = useSelector((state) => state.drafts);
  const navigate = useNavigate();
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    setLoading(true);
    setInitialValues({
      title: props.initialValues.title,
      topic: props.initialValues.topic,
      image: props.initialValues.image,
      text: props.initialValues.text,
    });
    setLoading(false);
  }, [props.initialValues]);
  //console.log("hi",props.id,props.initialValues);
  const validationSchema = yup.object({
    title: yup.string().required("Title is required"),
    topic: yup.string().required("title is required"),
    image: yup.string().required("Image is required"),
    text: yup.string().required("text is required"),
  });

  const addPost = async (values) => {
    const date = new Date();
    const articlesCollection = collection(db, "articles");
    await addDoc(articlesCollection, {
      ...values,
      created_at: date,
      author: username,
      view: 0,
      liked_by: [],
      comments: [],
    });
    setRevisionHistory(
      revisionHistory,
      dispatch,
      currUser,
      values.title,
      "added"
    );
  };
  const updatePost = async (id, values) => {
    const newPost = { ...props.initialValues, ...values, author: username };
    //console.log(newPost);
    const article = doc(db, "articles", id);
    await updateDoc(article, newPost);
    setRevisionHistory(
      revisionHistory,
      dispatch,
      currUser,
      props.initialValues.title,
      "updated"
    );
  };
  const handleDraft = async (values) => {
    //console.log(values);
    console.log('adding in drafts');
    let newValues = { ...values, id: Date.now() };
    const exists = await checkUrlExists(values.image);
    if (!exists) {
      newValues.image =
        "https://notion-blog-wildcatco.vercel.app/_next/image?url=https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252F458d78d3-2b75-4ac1-a9b6-8373ef3110a5%252Fmarek-piwnicki-GV2YhjYpQZM-unsplash.jpg%3Ftable%3Dblock%26id%3D3caebeb5-9453-44ed-902a-7458f9bb52c7%26cache%3Dv2&w=1920&q=75";
    }
    const newDrafts = [newValues, ...drafts];
    //console.log(newDrafts);
    dispatch(actions.changeCurrentUserDrafts(newDrafts));
    const userRef = doc(db, "users", currUser.id);
    const newUser = { ...currUser, drafts: newDrafts };
    console.log(newUser);
    await updateDoc(userRef, newUser);
  };
  if (loading) return <div>Loading</div>;
  return (
    <div className="container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          if (!isDraft) {
            console.log('adding to my post');
            let newValues = values;
            try {
              const exists = await checkUrlExists(values.image);
              //console.log(values.image);
              if (!exists) {
                newValues = {
                  ...values,
                  image:
                    "https://notion-blog-wildcatco.vercel.app/_next/image?url=https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252F458d78d3-2b75-4ac1-a9b6-8373ef3110a5%252Fmarek-piwnicki-GV2YhjYpQZM-unsplash.jpg%3Ftable%3Dblock%26id%3D3caebeb5-9453-44ed-902a-7458f9bb52c7%26cache%3Dv2&w=1920&q=75",
                };
              }
              //console.log("exists", exists);
            } catch (err) {
              console.log(err);
            }
            if (props.id === undefined) {
              try {
                addPost(newValues);
              } catch (err) {
                console.log(err);
              }
              resetForm();
            } else {
              try {
                //console.log(newValues);
                updatePost(props.id, newValues);
              } catch (err) {
                console.log(err);
              }
            }
          }
          else{
            handleDraft(values);
            resetForm();
          }
        }}
      >
        {({
          values,
          handleBlur,
          handleChange,
          handleSubmit,
          errors,
          touched,
        }) => (
          <form noValidate onSubmit={handleSubmit} className="newpost-form">
            <div>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                className="newpost-input"
              />
              {touched.title && errors.title && (
                <div className="newpost-error">{errors.title}</div>
              )}
            </div>
            <div>
              <input
                type="text"
                name="topic"
                placeholder="Topic"
                value={values.topic}
                onChange={handleChange}
                onBlur={handleBlur}
                className="newpost-input"
              />
            </div>
            <div>
              <input
                type="text"
                name="image"
                placeholder="Featured Image URL"
                value={values.image}
                onChange={handleChange}
                onBlur={handleBlur}
                className="newpost-input"
              />
              <ErrorMessage
                name="image"
                component="div"
                className="newpost-error"
              />
            </div>
            <div>
              <input
                type="text"
                name="text"
                placeholder="Text"
                value={values.text}
                onChange={handleChange}
                onBlur={handleBlur}
                className="newpost-input"
              />
              <ErrorMessage
                name="text"
                component="div"
                className="newpost-error"
              />
            </div>

            <button type="submit" className="newpost-button">
              Add Post
            </button>
            {props.id === undefined && (
              <button
                className="newpost-button"
                onClick={() => setIsDraft(true)}
              >
                Save as draft
              </button>
            )}
          </form>
        )}
      </Formik>

      <Link to="/">
        <button className="newpost-button">View Posts</button>
      </Link>
    </div>
  );
};

export default NewPost;
