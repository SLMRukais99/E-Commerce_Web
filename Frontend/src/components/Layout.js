import React from "react";
import { Outlet } from "react-router-dom"; //react dom la iruku outlete dynamic aha run panna
import Footer from "./Footer";
import Header from "./Header";

import { ToastContainer } from "react-toastify"; //toast kkan package
/*Toast = oru small popup notification.
For example:
"Login successful!"
"Product added to cart"
"Something went wrong"
react-toastify package la irukura feature idhu.
<ToastContainer /> is the area in your app where all toast messages will show up.
*/
import "react-toastify/dist/ReactToastify.css";


const Layout = () => {
  return (
    <>
      <Header /> {/* Header - mela render aagum (constant-a irukum).*/}
      <Outlet /> {/* Outlet - naduvula irukum spot, inga than current page load aagum. Page content (Home / About / Contact) mattum dynamic-a Outlet kulla varum.*/}
      <Footer /> {/* Footer - keela render aagum (constant-a irukum). */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Layout;
