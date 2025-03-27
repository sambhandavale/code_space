interface ProfileProps {
  firstName: string | undefined;
  size?: number;
}

const DefaultProfile = ({ firstName, size = 30 }:ProfileProps) => {
  const initial = firstName?.charAt(0).toUpperCase();

  return (
    <div className="profile-circle ff-google-n" style={{ width: size, height: size, fontSize: size / 2 }}>
      {initial}
    </div>
  );
};

export default DefaultProfile;
