import { useEffect, useState } from "react";
import ProfileCard from "../../components/User/ProfileCard";
import UserActivities from "../../components/User/UserActivities";
import UserStreaks from "../../components/User/UserStreaks";
import { IFavorites, IProfileCardInfo, ISocials, IUserBlogSummary, IUserProfile, IUserQuestionsSolved } from "../../interfaces/UserInterfaces";
import { getAction, postAction } from "../../services/generalServices";
import { useNavigate, useParams } from "react-router";
import UserFavourites from "../../components/User/UserFavourites";
import UserSocials from "../../components/User/UserSocials";
import UserMatches from "../../components/User/UserMatches";
import { isAuth } from "../../utility/helper";
import { toast } from "sonner";
import UserBlogs from "../../components/User/UserBlogs";
import axiosInstance from "../../utility/axios_interceptor";
import UserQuestionsSolved from "../../components/User/UserQuestionsSolved";

type ActivityType = "match" | "question" | "both";

interface ActivityDay {
  date: string;
  count: number;
  type: ActivityType;
}

const UserProfile = () =>{
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [userProfileInfo, setUserProfileInfo] = useState<IUserProfile>();

    const [userProfileCard, setUserProfileCard] = useState<IProfileCardInfo>();
    const [userSocialLinks, setUserSocialLinks] = useState<ISocials[]>([]);
    const [userFavourites, setUserFavourites] = useState<IFavorites[]>([]);
    const [userBlogs, setUserBlogs] = useState<IUserBlogSummary[]>([]);
    const [questionsSolved,setQuestionsSolved] = useState<IUserQuestionsSolved[]>([]);

    const [isOnline, setIsOnline] = useState<boolean>(false);
 
    useEffect(() => {
        if (username && username !== username.toLowerCase()) {
            navigate(`/profile/${username.toLowerCase()}`, { replace: true });
        }
    }, [username]);

    const getUserInfo = async () =>{
        try{
            const res = await getAction(`/users/profile?username=${username?.toLowerCase()}`)
            setUserProfileInfo(res.data.data);
            setLoading(false);
        }catch(err){
            console.error(err)
        }finally{
            setLoading(false);
        }
    }

    const getOnlineUsers = async () =>{
        try{
            const res = await getAction(`/users/onlineUsers?username=${username?.toLowerCase()}`)
            setIsOnline(res.data.isUserOnline)
        }catch(err){
            console.error(err)
        } 
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    getUserInfo(),
                    getOnlineUsers()
                ]);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    async function getImageHash(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.src = objectUrl;

        image.onload = async () => {
            const width = image.width;
            const height = image.height;
            // const aspectRatio = width / height;

            // 🧠 Enforce aspect ratio rule (tall images are not allowed)
            // if (aspectRatio < 0.8) {
            //     toast.error("Image is too tall. Please use a wider image (e.g., 4:3 or square).");
            //     URL.revokeObjectURL(objectUrl);
            //     return;
            // }

            try {
                // 🔐 Compute image hash to check for duplicates
                const imageHash = await getImageHash(file);

                const formData = new FormData();
                formData.append("image", file);
                formData.append("userId", isAuth()._id);
                formData.append("hash", imageHash);

                const res = await axiosInstance.post('/users/upload-profile-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const { imageUrl } = res.data;

                setUserProfileCard(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        profileImage: imageUrl
                    };
                });

                toast.success("Profile image updated.");
            } catch (err) {
                console.error(err);
                toast.error("Failed to upload profile image.");
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        };

        image.onerror = () => {
            toast.error("Failed to load image.");
            URL.revokeObjectURL(objectUrl);
        };
    };


    useEffect(() => {
        if (userProfileInfo?.userSocials) {
            setUserSocialLinks(userProfileInfo.userSocials);
        }
        if (userProfileInfo?.userFavourites) {
            setUserFavourites(userProfileInfo.userFavourites);
        }
        if (userProfileInfo?.profileCardInfo) {
            setUserProfileCard(userProfileInfo.profileCardInfo);
        }
        if(userProfileInfo?.userBlogs){
            setUserBlogs(userProfileInfo.userBlogs);
        }
        if(userProfileInfo?.userSolvedQuestions){
            setQuestionsSolved(userProfileInfo.userSolvedQuestions);
        }
    }, [userProfileInfo]);

    const convertActivityData = (
    daily_matches: Record<string, { count: number }> | undefined,
    solved: IUserQuestionsSolved[] | undefined
    ): ActivityDay[] => {
    const activityMap: Record<
        string,
        { count: number; type: Set<ActivityType> }
    > = {};

    // 🏁 Add match counts
    if (daily_matches) {
        for (const date in daily_matches) {
        if (!activityMap[date]) activityMap[date] = { count: 0, type: new Set() };
        activityMap[date].count += daily_matches[date].count;
        activityMap[date].type.add("match");
        }
    }

    // ✅ Add solved-question counts
    if (solved) {
        solved.forEach((q) => {
        const d = new Date(q.solved_at).toLocaleDateString("en-CA");
        if (!activityMap[d]) activityMap[d] = { count: 0, type: new Set() };
        activityMap[d].count += 1;
        activityMap[d].type.add("question");
        });
    }

    // Convert to array
    return Object.entries(activityMap).map(([date, { count, type }]) => ({
        date,
        count,
        type: type.size === 2 ? "both" : [...type][0]        // "both" if both types occurred
    }));
    };


    const handleGlobalSave = async () =>{
        try{
            const data = {
                userId:isAuth()._id,
                socials:userSocialLinks,
                favorites:userFavourites,
                profileCardInfo:userProfileCard,
            }
            const res = await postAction('/users/update-profile',data);
            if(res.status === 200){
                setUserSocialLinks(res.data.data)
                toast.success(res.data.message)
                getUserInfo();
            } else if(res.status === 404){
                toast.error(res.data.message)
            } else{
                toast.message(res.data.message);
            }
        }catch(err){
            console.error(err)
        }
    }

    return(
        <div className="profile_page">
            <div className="profile-r-s1">
                <div className="profile-r-s1-c-s1">
                    <ProfileCard 
                        profilecard_info={userProfileInfo?.profileCardInfo}
                        userProfileCard={userProfileCard}
                        setUserProfileCard={setUserProfileCard}
                        handleGlobalSave={handleGlobalSave}
                        isOnline={isOnline}
                        handleProfileImageChange={handleProfileImageChange}
                        loading={loading}
                    />
                    <UserStreaks 
                        userstreak_info={userProfileInfo?.userStreaks}
                        loading={loading}
                    />
                </div>
                <div className="profile-r-s1-c-s2">
                    <UserActivities 
                        data={convertActivityData(userProfileInfo?.dailyMatches, userProfileInfo?.userSolvedQuestions)}
                        userInfo={userProfileInfo?.profileCardInfo}
                        loading={loading}
                    />

                    <div className="user_extras">
                        <UserFavourites
                            tiles={userProfileInfo?.userFavourites}
                            userInfo={userProfileInfo?.profileCardInfo}
                            userFavourites={userFavourites}
                            setUserFavourites={setUserFavourites}
                            handleGlobalSave={handleGlobalSave}
                            loading={loading}
                        />
                        <UserSocials
                            tiles={userProfileInfo?.userSocials}
                            userInfo={userProfileInfo?.profileCardInfo}
                            userSocialLinks={userSocialLinks}
                            setUserSocialLinks={setUserSocialLinks}
                            handleGlobalSave={handleGlobalSave}
                            loading={loading}
                        />
                    </div>
                    <UserMatches 
                        matches={userProfileInfo?.userMatches} 
                        userInfo={userProfileInfo?.profileCardInfo}
                        loading={loading}
                    />
                    <UserBlogs
                        userBlogs={userBlogs}
                        userInfo={userProfileInfo?.profileCardInfo}
                        loading={loading}
                    />
                    {questionsSolved.length > 0 && (
                        <UserQuestionsSolved
                            questions={questionsSolved} 
                            userInfo={userProfileInfo?.profileCardInfo}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
            <div className="profile-r-s1">
            </div>
        </div>
    )
}

export default UserProfile;