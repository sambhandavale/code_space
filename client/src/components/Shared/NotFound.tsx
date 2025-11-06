const NotFound = ({
  toptext="404 - Page Not Found",
  bottomtext="The page you are looking for does not exist."}) => {
  return (
    <div className="notfound">
        <h1 className="ff-google-n white">{toptext}</h1>
        <p className="ff-google-n white">{bottomtext}</p>
    </div>
  );
};

export default NotFound;
