import { useEffect, useState } from "react";
import { GenericListPage } from "../../../components/Shared/GenericListPage";
import { PythonIcon } from "../../../components/Shared/Icons/Languages/Python";
import { ShareIcon } from "../../../components/Shared/Icons/Share";
import { IContest } from "../../../interfaces/ContestInterfaces";
import { getAction } from "../../../services/generalServices";
import { useNavigate } from "react-router";

const Contests = () =>{
    const [contests, setContests] = useState<IContest[]>([]);
    const navigate = useNavigate();

    const getContests = async () =>{
        try{
            const res = await getAction('/events/contest/all?visibility=public');
            if(res && res.data){
                setContests(res.data.data);
                console.log(res.data.data);
            }
        } catch(err){
            console.error(err);
        }
    }

    useEffect(()=>{
        getContests();
    },[])

    return(
        <GenericListPage header={'Contests'} >
            <div className="contest__list">
                {contests.map((contest)=>(
                    <div className="event_box">
                        <div className="eb_l1">
                            <div className="event_details">
                                <div className="title ff-kanit-n">{contest.title}</div>
                                <div className="tags">
                                    {contest.tags.map((tag,i)=>(
                                        <div className={`tag ${i==0 ? 'ff-kanit-b':'ff-kanit-n'}`}>{tag}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="share pointer" onClick={()=> navigate(`/event/contests/${contest._id}/${contest.slug}`)}>
                                <ShareIcon size={16} color="#fff" />
                            </div>
                        </div>
                        <div className="eb_l2">
                            <div className="event_meta">
                                <div className="meta_title ff-kanit-n">LANGUAGES</div>
                                <div className="meta_tags">
                                    {contest.languages.map((lang)=>(
                                        <div className="meta_tag glassmorphism-medium ff-kanit-n">
                                            <img src={`/icons/languages/${lang}.svg`} alt="" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="participants">
                                <div className="participants__profiles">
                                    <img src="/assets/user/testprofile1.png" alt="" />
                                    <img src="/assets/user/testprofile1.png" alt="" />
                                    <img src="/assets/user/testprofile1.png" alt="" />
                                </div>
                                <div className="participants__count ff-google-n">100+ Coders</div>
                            </div>
                        </div>
                        <div className="eb_l3">
                            <div className="event__timing">
                                <div className="date ff-google-n">Every Tuesday</div>
                                <div className="time ff-google-n">From 12:00 PM</div>
                            </div>
                            <div className="register__bt ff-google-b clickbutton" onClick={()=> navigate(`/event/contests/${contest._id}/${contest.slug}`)}>ENTER</div>
                        </div>
                    </div>
                ))}
            </div>
        </GenericListPage>
    )
}

export default Contests;