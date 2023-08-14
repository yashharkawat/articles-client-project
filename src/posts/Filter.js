import { Formik } from "formik";
import { useState } from "react";

export const Filter = (props) => {
  const vals = { author: "", date: "", likes: "", comments: "" };
  const [initialValues, setInititialValues] = useState(vals);
  const removeHandler = (resetForm) => {
    resetForm();
    props.sendFilter(vals);
  };
  return (
    <div className="align-top margin-top-neg">
      <Formik
        initialValues={initialValues}
        onSubmit={(values, { resetForm }) => {
          //console.log(values);
          props.sendFilter(values);
          setInititialValues(values);
        }}
      >
        {({ values, handleChange, handleSubmit ,resetForm}) => (
          <form onSubmit={handleSubmit} className="filter-form">
            <div>
              <h2 style={{ textAlign: "center", color: "white" }}>
                Add Filters
              </h2>
              <label className="filter-text">Filter by Author:</label>
              <input
                type="text"
                name="author"
                value={values.author}
                onChange={handleChange}
                className="filter-form-input"
                placeholder="author name"
              />
            </div>
            <div>
              <label className="filter-text">Filter by Date: </label>
              <input
                type="date"
                name="date"
                value={values.date}
                onChange={handleChange}
                className="filter-form-input"
              />
            </div>
            <div>
              <label className="filter-text">Filter by Likes: </label>
              <input
                type="number"
                name="likes"
                value={values.likes}
                onChange={handleChange}
                className="filter-form-input"
                placeholder="num of likes"
              />
            </div>
            <div>
              <label className="filter-text">Filter by Comments: </label>
              <input
                type="number"
                name="comments"
                value={values.comments}
                onChange={handleChange}
                className="filter-form-input"
                placeholder="num of comments"
              />
            </div>
            <div className="flex space-between">
              <button
                className="filter-button"
                onClick={() => removeHandler(resetForm)}
              >
                Remove Filters
              </button>
              <button className="filter-button" type="submit">
                Apply Filters
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};
