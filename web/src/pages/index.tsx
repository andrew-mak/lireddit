import { withUrqlClient } from "next-urql";
import Posts from "../components/Posts";
import Layout from "../components/UI/Layout";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  return (
    <Layout>
      <Posts />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
