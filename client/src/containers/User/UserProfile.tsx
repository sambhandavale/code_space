import { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import ProfileCard from "../../components/User/ProfileCard";
import UserActivities from "../../components/User/UserActivities";
import UserStreaks from "../../components/User/UserStreaks";
import { IFavorites, IProfileCardInfo, ISocials, IUserBlogSummary, IUserProfile } from "../../interfaces/UserInterfaces";
import { getAction, postAction } from "../../services/generalServices";
import { useParams } from "react-router";
import UserFavourites from "../../components/User/UserFavourites";
import UserSocials from "../../components/User/UserSocials";
import UserMatches from "../../components/User/UserMatches";
import { isAuth } from "../../utility/helper";
import { toast } from "sonner";
import UserBlogs from "../../components/User/UserBlogs";

const UserProfile = () =>{
    const { username } = useParams<{ username: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [userProfileInfo, setUserProfileInfo] = useState<IUserProfile>();

    const [userProfileCard, setUserProfileCard] = useState<IProfileCardInfo>();
    const [userSocialLinks, setUserSocialLinks] = useState<ISocials[]>([]);
    const [userFavourites, setUserFavourites] = useState<IFavorites[]>([]);
    const [userBlogs, setUserBlogs] = useState<IUserBlogSummary[]>([]);

    const getUserInfo = async () =>{
        try{
            const res = await getAction(`/users/profile?username=${username}`)
            setUserProfileInfo(res.data.data);
            setLoading(false);
        }catch(err){
            console.error(err)
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        getUserInfo();
    },[]);

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
    }, [userProfileInfo]);

    const convertMatchesToActivityData = (daily_matches: Record<string, { count: number }>): { date: string; count: number }[] => {
        const activityData: { date: string; count: number }[] = [];

        for (const date in daily_matches) {
            if (daily_matches.hasOwnProperty(date)) {
                activityData.push({
                    date: date,
                    count: daily_matches[date].count
                });
            }
        }

        return activityData;
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
        <Layout>
            {!loading && userProfileInfo && userProfileInfo.profileCardInfo && (
                <div className="profile_page">
                    <div className="profile-r-s1">
                        <div className="profile-r-s1-c-s1">
                            <ProfileCard 
                                profilecard_info={userProfileInfo?.profileCardInfo}
                                userProfileCard={userProfileCard}
                                setUserProfileCard={setUserProfileCard}
                                handleGlobalSave={handleGlobalSave}
                            />
                            <UserStreaks userstreak_info={userProfileInfo.userStreaks}/>
                        </div>
                        <div className="profile-r-s1-c-s2">
                            <UserActivities 
                                data={convertMatchesToActivityData(userProfileInfo.dailyMatches)}
                                userInfo={userProfileInfo?.profileCardInfo}
                            />

                            <div className="user_extras">
                                <UserFavourites
                                    tiles={userProfileInfo.userFavourites}
                                    userInfo={userProfileInfo?.profileCardInfo}
                                    userFavourites={userFavourites}
                                    setUserFavourites={setUserFavourites}
                                    handleGlobalSave={handleGlobalSave}
                                />
                                <UserSocials
                                    tiles={userProfileInfo.userSocials}
                                    userInfo={userProfileInfo?.profileCardInfo}
                                    userSocialLinks={userSocialLinks}
                                    setUserSocialLinks={setUserSocialLinks}
                                    handleGlobalSave={handleGlobalSave}
                                />
                            </div>
                            <UserMatches 
                                matches={userProfileInfo.userMatches} 
                                userInfo={userProfileInfo?.profileCardInfo}
                            />
                            <UserBlogs
                                userBlogs={userBlogs}
                                userInfo={userProfileInfo?.profileCardInfo}
                            />
                        </div>
                    </div>
                    <div className="profile-r-s1">
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default UserProfile;