interface ProfileProps {
  initals: string;
  scale?: number;
}

const DefaultProfile = ({ initals, scale = 1 }:ProfileProps) => {

  return (
    <div className="profile-circle ff-google-n">
      {initals}
    </div>
  );
};

export default DefaultProfile;
