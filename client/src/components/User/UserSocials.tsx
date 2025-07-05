import { useMemo, useState } from "react";
import { IProfileCardInfo, ISocials } from "../../interfaces/UserInterfaces";
import { BsPencil, BsCheck } from 'react-icons/bs';
import { isAuth } from "../../utility/helper";
import { FaSave } from 'react-icons/fa';

interface UserSocialsProps {
    tiles: ISocials[] | undefined;
    userInfo: IProfileCardInfo | undefined;
    userSocialLinks: ISocials[];
    setUserSocialLinks: React.Dispatch<React.SetStateAction<ISocials[]>>;
    handleGlobalSave: (updatedLinks: ISocials[]) => void;
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
    loading
}: UserSocialsProps) => {
    const [editIndex, setEditIndex] = useState<{ row: number; idx: number } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");

    const itsMe = isAuth() ? userInfo?.username === isAuth().username : false;

    const chunkedTiles = chunkArray(userSocialLinks, 2);

    const getImageSrc = (label: string) => {
        return `/icons/socials/dark/${label.toLowerCase()}.svg`;
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
                            <div className="global-save-btn gls-box glassmorphism-medium" onClick={handleGlobalSaveClick}>
                                <FaSave />
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
