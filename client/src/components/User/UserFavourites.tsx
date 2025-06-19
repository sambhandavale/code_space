import { useMemo, useState } from "react";
import { IFavorites, IProfileCardInfo } from "../../interfaces/UserInterfaces";
import { languages, timeControls } from "../../utility/general-utility";
import { isAuth } from "../../utility/helper";
import { BsPencil, BsCheck } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';

interface UserFavouritesProps {
    tiles: any[] | undefined;
    userInfo: IProfileCardInfo | undefined;
    userFavourites: IFavorites[];
    setUserFavourites: React.Dispatch<React.SetStateAction<IFavorites[]>>;
    handleGlobalSave: (updatedLinks: IFavorites[]) => void;
    loading: boolean;
}

const chunkArray = (array: any[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

const UserFavourites = ({
    tiles,
    userInfo,
    userFavourites,
    setUserFavourites,
    handleGlobalSave,
    loading
}: UserFavouritesProps) => {
    const [editIndex, setEditIndex] = useState<{ row: number; idx: number } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");

    const itsMe = isAuth() ? userInfo?.username === isAuth().username : false;

    const chunkedTiles = chunkArray(userFavourites, 2);

    const handleEditClick = (rowIndex: number, idx: number, currentValue: string) => {
        setEditIndex({ row: rowIndex, idx });
        setEditedValue(currentValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedValue(e.target.value);
    };

    const handleSave = () => {
        if (editIndex) {
            const { row, idx } = editIndex;
            const tileIndex = row * 2 + idx;

            const updatedFavourites = [...userFavourites];
            updatedFavourites[tileIndex] = {
                ...updatedFavourites[tileIndex],
                value: editedValue
            };

            setUserFavourites(updatedFavourites);
        }
        setEditIndex(null);
    };

    const hasChanges = useMemo(() => {
        return JSON.stringify(tiles) !== JSON.stringify(userFavourites);
    }, [tiles, userFavourites]);

    const handleGlobalSaveClick = () => {
        handleGlobalSave(userFavourites);
    };

    const getImageSrc = (label: string, value: string) => {
        if (label === 'Language') {
            return `/icons/languages/${languages.find((l) => l.name === value)?.icon}.svg`;
        }
        if (label === 'Time Control') {
            return `/assets/challenge/time-controls/${timeControls.find((tc) => `${tc.time}` === value)?.name.toLowerCase()}.svg`;
        }
        return '';
    };

    const allValuesAreEmpty = userFavourites.every(fav => fav.value.trim() === '' || fav.value.trim() === '...');

    if (!itsMe && allValuesAreEmpty) {
        return null;
    }

    return (
        <>
            {!loading ? (
                <div className="user-section">
                    <header className="ff-google-n white flex justify-between items-center" style={{ position: "relative" }}>
                        {itsMe ? 'Your' : `${userInfo?.username}'s`} Favourites
                        {itsMe && hasChanges && (
                            <div className="global-save-btn gls-box glassmorphism-medium" onClick={handleGlobalSaveClick}>
                                <FaSave />
                            </div>
                        )}
                    </header>
                    {chunkedTiles.map((row, rowIndex) => (
                        <div className="section_tile__row" key={rowIndex}>
                            {row.map((tile, idx) => {
                                const label = tile.category ?? '...';
                                const value = tile.value !== '' ? tile.value : '...';
                                const imageSrc = getImageSrc(label, value);
                                const isEditing = editIndex?.row === rowIndex && editIndex?.idx === idx;

                                const isEditable = label !== 'Language' && label !== 'Time Control';

                                if (!itsMe && value === '...') {
                                    return null;
                                }

                                return (
                                    <div className="section_tile" key={idx}>
                                        <div className="section_tile__label ff-google-n white flex items-center gap-2">
                                            {label}
                                            {isEditable && !isEditing && itsMe && (
                                                <div
                                                    className="edit-btn"
                                                    onClick={() => handleEditClick(rowIndex, idx, tile.value || "")}
                                                >
                                                    <BsPencil size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="section_tile__value ff-google-n white flex items-center gap-2">
                                            {(label === 'Language' || label === 'Time Control') && imageSrc && value !== '...' && (
                                                <img src={imageSrc} alt={value} />
                                            )}
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
                                                `${value}${label === 'Time Control' ? 'Min' : ''}`
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ) : (
                <UserFavouritesSkeleton />
            )}
        </>
    );
};

const UserFavouritesSkeleton = () => {
    return (
        <div className="user-section">
            <div className="skeleton-box" style={{ width: "150px", height: "20px", marginBottom: "20px" }}></div>
            {Array.from({ length: 2 }).map((_, rowIndex) => (
                <div className="section_tile__row" key={rowIndex}>
                    {Array.from({ length: 2 }).map((_, idx) => (
                        <div className="section_tile" key={idx}>
                            <div className="section_tile__label ff-google-n white flex items-center gap-2">
                                <div className="skeleton-box" style={{ width: "80px", height: "15px" }}></div>
                            </div>
                            <div className="section_tile__value ff-google-n white flex items-center gap-2">
                                <div className="skeleton-box" style={{ width: "100px", height: "15px" }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default UserFavourites;
