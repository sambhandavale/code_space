interface ProfileProps {
  initals: string;
  size?: number;
}

const DefaultProfile = ({ initals }:ProfileProps) => {

  return (
    <div className="profile-circle ff-google-n">
      {initals}
    </div>
  );
};

export default DefaultProfile;
