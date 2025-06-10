import { useState, useMemo } from "react";
import { BsPencil, BsCheck } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { IProfileCardInfo } from "../../interfaces/UserInterfaces";
import { isAuth } from "../../utility/helper";

interface ProfileCardProps {
    profilecard_info: IProfileCardInfo;
    userProfileCard: IProfileCardInfo | undefined;
    setUserProfileCard: React.Dispatch<React.SetStateAction<IProfileCardInfo | undefined>>;
    handleGlobalSave: () => void;
}

const ProfileCard = ({
    profilecard_info,
    userProfileCard,
    setUserProfileCard,
    handleGlobalSave,
}: ProfileCardProps) => {
    const [editField, setEditField] = useState<string | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");

    const itsMe = isAuth() ? profilecard_info.username === isAuth().username : false;

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
        <div className="profile_card">
            <div className="profile_image">
                <img src="/assets/user/testprofile1.png" alt="" />
                <div className="userrating flex flex-col items-end justify-end gap-1">
                    <div className="rating ff-google-b white">Rating {profilecard_info.userRating}</div>
                    <div className="role ff-google-n white">{profilecard_info.userTitle}</div>
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
                    { label: "Email", field: "userEmail" },
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
                    <div className="detail_value ff-google-n white">{profilecard_info.joinedOn}</div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
