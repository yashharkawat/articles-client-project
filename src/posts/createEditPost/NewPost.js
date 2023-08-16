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
import Modal from "react-modal";

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

const History = ({ post, reset, deleteHandler }) => {
  return (
    <div className="history">
      <h3 className="post-title">{post.title}</h3>
      <div className="post-topic">{post.topic}</div>
      <div>{post.text}</div>
      <button className="newpost-button " onClick={() => deleteHandler(post.id)}>delete</button>
      <button className="newpost-button " onClick={() => reset(post)}>Reset to this version</button>
    </div>
  );
};

const Popup = ({ modalIsOpen, setModalIsOpen, post, changeValues ,setPost}) => {
  const [historys, setHistorys] = useState(post.revisionHistory);
  const reset = (values) => {
    changeValues(values);
    setModalIsOpen(false);
  };
  const deleteHandler = async (postId) => {
    const newHistory = historys.filter((history) => history.id !== postId);
    setHistorys(newHistory);
    const postRef = doc(db, "articles", post.id);
    const newPost = { ...post, revisionHistory: newHistory };
    setPost(newPost);
    await updateDoc(postRef, newPost);
  };
  return (
    <div className="popup">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Example Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Background color and opacity
            zIndex: 1000, // Adjust this value to control the stacking order
          },
          content: {
            width: "50%", // Width of the modal content
            height: "60%", // Height of the modal content
            margin: "auto", // Center the modal horizontally
            backgroundColor: "#1f2028", // Background color of the modal content
            borderRadius: "8px", // Rounded corners
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Box shadow
            // Add more styles as needed
          },
        }}
      >
        <div className="popup">
          <h2>Revision History</h2>
          <div className="">
            {historys.map((history) => (
              <History
                post={history}
                reset={reset}
                deleteHandler={deleteHandler}
                
              />
            ))}
          </div>
          <button className="newpost-button " onClick={() => setModalIsOpen(false)}>Close Popup</button>
        </div>
      </Modal>
    </div>
  );
};

const NewPost = (props) => {
  //const [loading,setLoading]=useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const username = useSelector((state) => state.name);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(true);
  const revisionHistory = useSelector((state) => state.revisionHistory);
  const dispatch = useDispatch();
  const currUser = useSelector((state) => state);
  const drafts = useSelector((state) => state.drafts);
  const [isDraft, setIsDraft] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [post, setPost] = useState(props.initialValues);
  useEffect(() => {
    setLoading(true);
    setInitialValues({
      title: props.initialValues.title,
      topic: props.initialValues.topic,
      image: props.initialValues.image,
      text: props.initialValues.text,
    });
    setLoading(false);
    setFormValues({
      title: props.initialValues.title,
      topic: props.initialValues.topic,
      image: props.initialValues.image,
      text: props.initialValues.text,
    });
  }, [props.initialValues]);
  //console.log("hi",props.id,props.initialValues);
  const validationSchema = yup.object({
    title: yup.string(),
    topic: yup.string(),
    image: yup.string(),
    text: yup.string(),
  });

  const addPost = async (values) => {

    const rev = {
      title: values.title,
      topic: values.topic,
      image: values.image,
      text: values.text,
      id: Date.now(),
    };

    const date = new Date();
    const articlesCollection = collection(db, "articles");
    let newHistory=[];newHistory.push(rev);
    //console.log("in add",values);
    await addDoc(articlesCollection, {
      ...values,
      created_at: date,
      author: username,
      view: 0,
      liked_by: [],
      comments: [],
      revisionHistory:newHistory,
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
    if(modalIsOpen) {
      return;
    }
    //saving revison history
    const rev = {
      title: formValues.title,
      topic: formValues.topic,
      image: formValues.image,
      text: formValues.text,
      id: Date.now(),
    };
    const newRevisonHistory = [rev, ...post.revisionHistory];

    const newPost = {
      ...post,
      ...formValues,
      author: username,
      revisionHistory: newRevisonHistory,
    };
    setPost(newPost);
    console.log('nnnn',newPost);
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
    console.log("adding in drafts");
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
    //console.log(newUser);
    await updateDoc(userRef, newUser);
  };
  const addRevisionHistory = () => {
    setModalIsOpen(true);
  };
  const handleChangeForm = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  const changeValues = (values) => {
    setFormValues({
      title: values.title,
      text: values.text,
      topic: values.topic,
      image: values.image,
    });
  };

  if (loading) return <div>Loading</div>;
  return (
    <div className="container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          if (!isDraft) {
            console.log("adding to my post");
            let newValues = { ...formValues };
            console.log(formValues);
            try {
              const exists = await checkUrlExists(values.image);
              //console.log(values.image);
              if (!exists) {
                newValues = {
                  ...formValues,
                  image:
                    "https://notion-blog-wildcatco.vercel.app/_next/image?url=https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252F458d78d3-2b75-4ac1-a9b6-8373ef3110a5%252Fmarek-piwnicki-GV2YhjYpQZM-unsplash.jpg%3Ftable%3Dblock%26id%3D3caebeb5-9453-44ed-902a-7458f9bb52c7%26cache%3Dv2&w=1920&q=75",
                };
                //console.log("exists",exists,newValues);
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
          } else {
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
                value={formValues.title}
                onChange={(e) => handleChangeForm("title", e.target.value)}
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
                value={formValues.topic}
                onChange={(e) => handleChangeForm("topic", e.target.value)}
                onBlur={handleBlur}
                className="newpost-input"
              />
            </div>
            <div>
              <input
                type="text"
                name="image"
                placeholder="Featured Image URL"
                value={formValues.image}
                onChange={(e) => handleChangeForm("image", e.target.value)}
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
                value={formValues.text}
                onChange={(e) => handleChangeForm("text", e.target.value)}
                onBlur={handleBlur}
                className="newpost-input"
              />
              <ErrorMessage
                name="text"
                component="div"
                className="newpost-error"
              />
            </div>
            {props.id !== undefined && (
              <button
                className="newpost-button"
                onClick={() => addRevisionHistory(values)}
              >
                See revision History
              </button>
            )}
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
      {modalIsOpen && (
        <Popup
          modalIsOpen={modalIsOpen}
          setModalIsOpen={setModalIsOpen}
          post={post}
          changeValues={changeValues}
          setPost={setPost}
        />
      )}
      <Link to="/">
        <button className="newpost-button">View Posts</button>
      </Link>
    </div>
  );
};

export default NewPost;
