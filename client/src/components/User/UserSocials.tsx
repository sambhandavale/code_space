import {  SetStateAction, useMemo, useState } from "react";
import { IProfileCardInfo, ISocials } from "../../interfaces/UserInterfaces";
import { BsPencil, BsCheck, BsCrosshair, BsX } from 'react-icons/bs';
import { isAuth } from "../../utility/helper";
import { FaSave } from 'react-icons/fa';
import { supportedPlatforms } from "../../utility/profile/socials";

interface UserSocialsProps {
    tiles: ISocials[] | undefined;
    userInfo: IProfileCardInfo | undefined;
    userSocialLinks: ISocials[];
    setUserSocialLinks: React.Dispatch<React.SetStateAction<ISocials[]>>;
    handleGlobalSave: (updatedLinks: ISocials[]) => void;
    newSocial:{
        platform: string;
        url: string;
    }
    setNewSocial:React.Dispatch<SetStateAction<{
        platform: string;
        url: string;
    }>>
    loading: boolean;
}

const chunkArray = (array: ISocials[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

export const getLastUrlSegment = (url: string) => {
    const segments = url.split('/').filter(segment => segment !== '');
    return segments.at(-1);
};

const UserSocials = ({
    tiles,
    userInfo,
    userSocialLinks,
    setUserSocialLinks,
    handleGlobalSave,
    newSocial,
    setNewSocial,
    loading
}: UserSocialsProps) => {
    const [addingNew, setAddingNew] = useState(false);
    const [editIndex, setEditIndex] = useState<{ row: number; idx: number } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");

    const itsMe = isAuth() ? userInfo?.username === isAuth().username : false;

    const chunkedTiles = chunkArray(userSocialLinks, 2);

    const getImageSrc = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (supportedPlatforms.includes(lowerLabel)) {
            return `/icons/socials/dark/${lowerLabel}.svg`;
        }
        return null;
    };


    const handleEditClick = (rowIndex: number, idx: number, currentValue: string) => {
        setEditIndex({ row: rowIndex, idx });
        setEditedValue(currentValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedValue(e.target.value);
    };

    const hasChanges = useMemo(() => {
        return JSON.stringify(tiles) !== JSON.stringify(userSocialLinks);
    }, [tiles, userSocialLinks]);

    const handleSave = () => {
        if (editIndex) {
            const { row, idx } = editIndex;
            const tileIndex = row * 2 + idx;

            const updatedSocialLinks = [...userSocialLinks];
            updatedSocialLinks[tileIndex] = {
                ...updatedSocialLinks[tileIndex],
                url: editedValue
            };

            setUserSocialLinks(updatedSocialLinks);
        }
        setEditIndex(null);
    };

    const handleGlobalSaveClick = () => {
        handleGlobalSave(userSocialLinks);
    };

    const handleAddNewSocial = () => {
        setAddingNew(true);
    };

    const handleNewSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewSocial(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveNewSocial = () => {
        if (newSocial.platform.trim() === "" || newSocial.url.trim() === "") return;

        const updatedSocialLinks = [
            ...userSocialLinks,
            { platform: newSocial.platform, url: newSocial.url },
        ];
        setUserSocialLinks(updatedSocialLinks);
        setNewSocial({ platform: "", url: "" });
        setAddingNew(false);
    };


    const allLinksAreEmpty = Array.isArray(userSocialLinks) && userSocialLinks.every(link => getLastUrlSegment(link.url) === '...');

    if (!itsMe && allLinksAreEmpty) {
        return null;
    }

    return (
        <>
            {!loading ? (
                <div className="user-section">
                    <header className="ff-google-n white flex justify-between items-center" style={{ position: "relative" }}>
                        {itsMe ? 'Your' : `${userInfo?.username}'s`} Socials
                        {itsMe && hasChanges && (
                            <div className="global-save-btn pointer glassmorphism-medium" onClick={handleGlobalSaveClick}>
                                <FaSave color="black"/>
                            </div>
                        )}
                    </header>
                    {chunkedTiles.map((row, rowIndex) => (
                        <div className="section_tile__row" key={rowIndex}>
                            {row.map((tile, idx) => {
                                const label = tile.platform ?? '...';
                                const imageSrc = getImageSrc(label);
                                const isEditing = editIndex?.row === rowIndex && editIndex?.idx === idx;

                                if (!itsMe && getLastUrlSegment(tile.url) === '...') {
                                    return null;
                                }

                                return (
                                    <div
                                        className={`section_tile ${tile.url.split('/').at(-1) !== '...' ? 'pointer' : ''}`}
                                        key={idx}
                                        onClick={() => tile.url.split('/').at(-1) !== '...' && !isEditing && window.open(tile.url, '_blank')}
                                    >
                                        <div className="section_tile__label ff-google-n white flex items-center gap-2">
                                            {imageSrc && tile.platform !== 'Portfolio' && (
                                                <img src={imageSrc} alt={label} />
                                            )}
                                            {label}
                                            {!isEditing && itsMe && (
                                                <div
                                                    className="edit-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(rowIndex, idx, tile.url || "");
                                                    }}
                                                >
                                                    <BsPencil size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="section_tile__value ff-google-n white flex items-center gap-1">
                                            {isEditing ? (
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
                                                getLastUrlSegment(tile.url)
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {itsMe && (
                        <div className="section_tile__row">
                            <div className="section_tile ff-google-n white flex items-center justify-center gap-2">
                                {!addingNew ? (
                                    <div
                                        className="flex items-center justify-center gap-2 pointer"
                                        onClick={handleAddNewSocial}
                                    >
                                        <span className="add-icon">+</span>
                                        <span>Add Social</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            name="platform"
                                            placeholder="Platform (e.g., Dev.to, Medium)"
                                            value={newSocial.platform}
                                            onChange={handleNewSocialChange}
                                            className="edit-input ff-google-n"
                                        />
                                        <input
                                            type="text"
                                            name="url"
                                            placeholder="URL (e.g., https://medium.com/@username)"
                                            value={newSocial.url}
                                            onChange={handleNewSocialChange}
                                            className="edit-input ff-google-n"
                                        />
                                        <div className="flex gap-3">
                                            <button className="save-btn white" onClick={handleSaveNewSocial}>
                                                <BsCheck size={18} color="white"/> Save
                                            </button>
                                            <button
                                                className="save-btn white"
                                                onClick={() => setAddingNew(false)}
                                            >
                                                <BsX size={18} color="white"/> Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <UserSocialsSkeleton />
            )}
        </>
    );
};

const UserSocialsSkeleton = () => {
    return (
        <div className="user-section">
            <div className="skeleton-box" style={{ width: "150px", height: "20px", marginBottom: "20px" }}></div>
            {Array.from({ length: 2 }).map((_, rowIndex) => (
                <div className="section_tile__row" key={rowIndex}>
                    {Array.from({ length: 2 }).map((_, idx) => (
                        <div className="section_tile" key={idx}>
                            <div className="section_tile__label ff-google-n white flex items-center gap-2">
                                <div className="skeleton-box" style={{ width: "20px", height: "20px", borderRadius: "50%" }}></div>
                                <div className="skeleton-box" style={{ width: "100px", height: "15px" }}></div>
                            </div>
                            <div className="section_tile__value ff-google-n white flex items-center gap-1">
                                <div className="skeleton-box" style={{ width: "120px", height: "15px" }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default UserSocials;
