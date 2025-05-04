import { Helmet } from "react-helmet";
import React from "react";
/*
1️⃣ import { Helmet } from "react-helmet";
react-helmet → React package to manage document head (<head> tag inside HTML).
*/


const Meta = (props) => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{props.title}</title>
    </Helmet>
  );
};

export default Meta;
