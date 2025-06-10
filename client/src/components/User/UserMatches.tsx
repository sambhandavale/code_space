import { useState } from "react";
import { IProfileCardInfo, IUserMatch } from "../../interfaces/UserInterfaces";
import { languages, timeControls } from "../../utility/general-utility";
import { isAuth } from "../../utility/helper";
import { useWindowWidth } from "../../utility/screen-utility";
import { useNavigate } from "react-router";

interface IUserMatchesProps {
    matches: IUserMatch[];
    userInfo: IProfileCardInfo;
}

const UserMatches = ({ matches, userInfo }: IUserMatchesProps) => {
    const width = useWindowWidth();
    const navigate = useNavigate();

    const matchesPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(matches.length / matchesPerPage);

    const paginatedMatches = matches
        .slice()
        .reverse()
        .slice((currentPage - 1) * matchesPerPage, currentPage * matchesPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="matches">
            <header>
                <div className="header_text ff-google-n white">{userInfo.username} Matches</div>
            </header>
            <div className="all_matches scrollbar">
                {paginatedMatches.map((match, index) => (
                    <div className="match pointer" key={index} onClick={() => navigate(`/challenge/live/${match.challengeId}`)}>
                        <div className={`index ff-google-n white ${timeControls.find((tc) => tc.time === match.time)?.name.toLowerCase()}`}>
                            {width > 600 ? (
                                <img
                                    src={`/assets/challenge/time-controls/${timeControls.find((tc) => tc.time === match.time)?.name.toLowerCase()}.svg`}
                                    alt=""
                                    className="time"
                                    aria-label={`${timeControls.find((tc) => tc.time === match.time)?.name} (${match.time}Min)`}
                                    title={`${timeControls.find((tc) => tc.time === match.time)?.name} (${match.time}Min)`}
                                />
                            ) : (
                                `${index + 1 + (currentPage - 1) * matchesPerPage}.`
                            )}
                        </div>
                        <div className="match_details">
                            <div className="match__users">
                                <div className="match__user ff-google-n white">
                                    {isAuth() ? (isAuth().username === userInfo.username ? "You" : userInfo.username) : userInfo.username}
                                </div>
                                {((width > 1100) || (width > 720 && width < 900)) && <div className="vs ff-google-n white">vs</div>}
                                <div className="match__user ff-google-n white">{isAuth() ? isAuth().username === match.opponentName ? 'You' : match.opponentName :match.opponentName}</div>
                            </div>
                            <div className="match__controls">
                                <div className="lang ff-google-n white flex items-center gap-2">
                                    <img src={`/icons/languages/${languages.find((l) => l.name === match.language)?.icon}.svg`} alt="" />
                                    {width > 600 && match.language}
                                </div>
                                {width < 600 && (
                                    <div className="ff-google-n white flex items-center gap-2">
                                        <img
                                            src={`/assets/challenge/time-controls/${timeControls.find((tc) => tc.time === match.time)?.name.toLowerCase()}.svg`}
                                            alt=""
                                        />
                                        {width > 600 && timeControls.find((tc) => tc.time === match.time)?.name}
                                    </div>
                                )}
                            </div>
                            {((width > 1100) || (width > 720 && width < 900)) && (
                                <div className="date ff-google-n white">{match.startTime}</div>
                            )}

                            <img src={`/icons/user/match_${match.result.toLowerCase()}.svg`} alt="" className="result" title={match.result} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination-controls flex justify-center gap-4">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="pagination-btn ff-google-n white"
                >
                    Previous
                </button>
                <span className="ff-google-n white">
                    {currentPage} of {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="pagination-btn ff-google-n white "
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default UserMatches;
