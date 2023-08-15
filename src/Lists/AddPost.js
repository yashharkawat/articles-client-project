import React, { useEffect, useState } from 'react';
import { Formik, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Link, useParams } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase'
import { useSelector,useDispatch } from 'react-redux';
import { actions } from '../store';
async function checkUrlExists(url) {
  try {
    if(url.includes("http://")) return true;
    const response = await fetch(url);
    const data=response.json();
    //console.log(data);
    if(data.url.includes('http://localhost')) return false;
    return true;  // Returns true for 2xx status codes
  } catch (error) {
    
    return false;  // Catch network errors or failed requests
  }
}
const AddPost = (props) => {
  //const [loading,setLoading]=useState(true);
  
  const params=useParams();
  //console.log(params.id);
  const username = useSelector(state => state.name);
  const [initialValues, setInitialValues] = useState({title:'',text:'',image:'',topic:''});
  
  const revisionHistory=useSelector(state=>state.revisionHistory);
  const dispatch=useDispatch();
  const currUser=useSelector(state=>state);

  
  //console.log("hi",props.id,props.initialValues);
  const validationSchema = yup.object({
    title: yup.string().required('Title is required'),
    topic: yup.string().required('title is required'),
    image: yup.string().required("Image is required"),
    text: yup.string().required('text is required'),
  });

  const addPost = async (values) => {
    //console.log(values);
    const date = Date.now();
    const lists=currUser.lists;
    const newLists=lists.map(ll=>{

        if(ll.id==params.id){
            const id=Date.now();
            const newPosts=[ ...ll.posts, {...values,id:id,created_at: date, author: username, view: 0 ,liked_by:[],comments:[]}]
            return {...ll,posts:newPosts};
        }
        return ll;
    });
    //console.log("in addpost",newLists);
    dispatch(actions.changeCurrentUserLists(newLists));

    const userRef=doc(db,"users",currUser.id);
    const newUser={...currUser,lists:newLists};
    await updateDoc(userRef,newUser);

//     const articlesCollection = collection(db, "articles");
//     await addDoc(articlesCollection, { ...values, created_at: date, author: username, view: 0 ,liked_by:[],comments:[]});
//     setRevisionHistory(revisionHistory,dispatch,currUser,values.title,"added");
   }
  
  return (
    <div className='container'>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={async (values, { resetForm }) => {
        let newValues=values;
        try{
          const exists=await checkUrlExists(values.image);
          console.log(values.image);
          if(!exists){
            newValues={...values,image:'https://notion-blog-wildcatco.vercel.app/_next/image?url=https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252F458d78d3-2b75-4ac1-a9b6-8373ef3110a5%252Fmarek-piwnicki-GV2YhjYpQZM-unsplash.jpg%3Ftable%3Dblock%26id%3D3caebeb5-9453-44ed-902a-7458f9bb52c7%26cache%3Dv2&w=1920&q=75'};
          }
          console.log("exists",exists);
        }
        catch (err){
          console.log(err);
        }
        try {
            addPost(newValues);
            resetForm();
          }
          catch (err) { console.log(err) };
        
      }}>
        {({ values, handleBlur, handleChange, handleSubmit, errors, touched }) => (
          <form noValidate onSubmit={handleSubmit} className="newpost-form">
            <div>
              <input type="text" name="title" placeholder="Title" value={values.title} onChange={handleChange} onBlur={handleBlur} className="newpost-input" />
              {touched.title && errors.title && <div className="newpost-error">{errors.title}</div>}
            </div>
            <div>
              <input type="text" name="topic" placeholder="Topic" value={values.topic} onChange={handleChange} onBlur={handleBlur} className="newpost-input" />

            </div>
            <div>
              <input type="text" name="image" placeholder="Featured Image URL" value={values.image} onChange={handleChange} onBlur={handleBlur} className="newpost-input" />
              <ErrorMessage name="image" component="div" className="newpost-error" />
            </div>
            <div>
              <input type="text" name="text" placeholder="Text" value={values.text} onChange={handleChange} onBlur={handleBlur} className="newpost-input" />
              <ErrorMessage name="text" component="div" className="newpost-error" />
            </div>
            
            <button type="submit" className="newpost-button">Add Post</button>
          </form>
        )}
      </Formik>
      
     </div>
  );
};

export default AddPost;