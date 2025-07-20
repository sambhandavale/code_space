import { useState, useMemo } from "react";
import { BsPencil, BsCheck } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { IProfileCardInfo } from "../../interfaces/UserInterfaces";
import { isAuth } from "../../utility/helper";
import { FiEdit } from "react-icons/fi";

interface ProfileCardProps {
    profilecard_info: IProfileCardInfo | undefined;
    userProfileCard: IProfileCardInfo | undefined;
    setUserProfileCard: React.Dispatch<React.SetStateAction<IProfileCardInfo | undefined>>;
    handleGlobalSave: () => void;
    isOnline:boolean;
    handleProfileImageChange:(e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    loading:boolean;
}

const ProfileCard = ({
    profilecard_info,
    userProfileCard,
    setUserProfileCard,
    handleGlobalSave,
    isOnline,
    handleProfileImageChange,
    loading,
}: ProfileCardProps) => {
    const [editField, setEditField] = useState<string | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");
    const [isProfileImageLoading, setIsProfileImageLoading] = useState(true);

    const itsMe = isAuth() ? profilecard_info?.username === isAuth().username : false;

    const handleEditClick = (field: string, currentValue: string) => {
        setEditField(field);
        setEditedValue(currentValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedValue(e.target.value);
    };

    const handleSave = () => {
        if (userProfileCard && editField) {
            setUserProfileCard({
                ...userProfileCard,
                [editField]: editedValue
            });
            setEditField(null);
        }
    };

    const hasChanges = useMemo(() => {
        return JSON.stringify(profilecard_info) !== JSON.stringify(userProfileCard);
    }, [profilecard_info, userProfileCard]);

    return (
        <>
        {!loading ? (
            <div className="profile_card"> 
                <div className="profile_image" style={{ position: "relative" }}>
                    
                    {isProfileImageLoading && (
                        <div className="image-loader">
                        </div>
                    )}

                    <img
                        src={userProfileCard?.profileImage || "/assets/user/testprofile1.png"}
                        alt=""
                        style={{
                            display: isProfileImageLoading ? "none" : "block",
                        }}
                        onLoad={() => setIsProfileImageLoading(false)}
                        onError={() => setIsProfileImageLoading(false)} // fallback still shown
                    />

                    {itsMe && (
                        <label className="pointer" style={{ position: "absolute", bottom: "1rem", left: "1rem", zIndex: "10" }}>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfileImageChange}
                            />
                            <div className="upload-btn">
                                <FiEdit size={20} color="white" />
                            </div>
                        </label>
                    )}

                    <div className="userrating flex flex-col items-end justify-end gap-1">
                        <div className="rating ff-google-b white">Rating {profilecard_info?.userRating}</div>
                        <div className="role ff-google-n white flex gap-2">
                            {profilecard_info?.userTitle}
                            {isOnline && (
                                <div className="flex gap-1 items-center">
                                    <div className="circle green"></div>
                                    <span className="ff-google-n white">Online</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile_details">
                    {itsMe && hasChanges && (
                        <div className="global-save-btn gls-box glassmorphism-medium" onClick={handleGlobalSave}>
                            <FaSave color="white"/>
                        </div>
                    )}
                    {[
                        { label: "Name", field: "fullName" },
                        { label: "Username", field: "username" },
                        ...(itsMe || userProfileCard?.userBio ? [{ label: "I am ", field: "userBio" }] : []),
                        // { label: "Email", field: "userEmail" },
                    ].map(({ label, field }) => (
                        <div className="detail" key={field}>
                            <div className="detail_label ff-google-n white flex items-center gap-2">
                                {label}
                                {itsMe && (
                                    <div
                                        className="edit-btn"
                                        onClick={() => handleEditClick(field, userProfileCard ? String(userProfileCard[field as keyof IProfileCardInfo]) : '')}
                                    >
                                        <BsPencil size={12} />
                                    </div>
                                )}
                            </div>
                            <div className="detail_value ff-google-n white flex items-center gap-1">
                                {editField === field ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editedValue}
                                            onChange={handleInputChange}
                                            className="edit-input ff-google-n"
                                        />
                                        <div className="save-btn" onClick={handleSave}><BsCheck size={24} /></div>
                                    </>
                                ) : (
                                    userProfileCard ? userProfileCard[field as keyof IProfileCardInfo] : ''
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="detail">
                        <div className="detail_label ff-google-n white">Joined on</div>
                        <div className="detail_value ff-google-n white">{profilecard_info?.joinedOn}</div>
                    </div>
                </div>
            </div>
        ):(
            <ProfileCardSkeleton/>
        )}
        </>
    );
};

const ProfileCardSkeleton = () => {
    return (
        <div className="profile_card">
            <div className="profile_image" style={{alignSelf:"stretch"}}>
                <div className="skeleton-box" style={{ width: "120px", height: "120px", borderRadius: "1rem" , alignSelf:"stretch", flex:"1 0 0"}}></div>
                <div className="userrating flex flex-col items-end justify-end gap-1">
                    <div className="skeleton-box" style={{ width: "80px", height: "15px", marginBottom: "5px" }}></div>
                    <div className="skeleton-box" style={{ width: "60px", height: "12px" }}></div>
                </div>
            </div>

            {/* Profile Details Skeleton */}
            <div className="profile_details">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div className="detail" key={index}>
                        <div className="detail_label ff-google-n white flex items-center gap-2">
                            <div className="skeleton-box" style={{ width: "80px", height: "15px" }}></div>
                        </div>
                        <div className="detail_value ff-google-n white flex items-center gap-1">
                            <div className="skeleton-box" style={{ width: "120px", height: "15px" }}></div>
                        </div>
                    </div>
                ))}
                <div className="detail">
                    <div className="detail_label ff-google-n white">
                        <div className="skeleton-box" style={{ width: "80px", height: "15px" }}></div>
                    </div>
                    <div className="detail_value ff-google-n white">
                        <div className="skeleton-box" style={{ width: "100px", height: "15px" }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
