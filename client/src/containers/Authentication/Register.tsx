import Layout from "../../components/Layout/Layout"
import AuthContainer from "../../components/Authentication/AuthContainer"

const Register = () => {
    return (
      <Layout>
          <div className="register">
            <AuthContainer
              method="register"
              route="/auth/signup"
            />
          </div>
      </Layout>
    )
  }
  
  export default Register
  