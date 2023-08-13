import React, { useEffect, useState } from 'react';
import NewPost from './NewPost';
import { useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase'
const Edit = () => {
  const [post, setPost] = useState({});
  const params = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const getArticles = async () => {
      const articlesCollection = collection(db, "articles");
      const data = await getDocs(articlesCollection);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const editpost = filteredData.filter(item => item.id == params.id);
      
      setPost(editpost[0]);
      console.log(editpost[0]);
      setLoading(false);
    }
    try {
      getArticles();
    }
    catch (err) { console.log(err) }
    
  }, [params.id])

  if(loading){
    return <>Loading</>

  }
  return (
    <div>
      <h2 className='container'>Edit Post</h2>
      <NewPost initialValues={post} id={params.id} />
    </div>
  );
};

export default Edit;
