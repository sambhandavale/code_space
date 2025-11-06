import { useParams } from "react-router-dom";
import { getAction } from "../../../services/generalServices";
import { useEffect, useState } from "react";
import { I3ContestParticipants, IContest } from "../../../interfaces/ContestInterfaces";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formattedDate } from "../../../utility/Contest/dates-utility";
import { renderCountdown, useCountdown } from "../../../components/Shared/CountDown";
import { toast } from "sonner";
import NotFound from "../../../components/Shared/NotFound";

const ContestHome = () => {
  const { contestId } = useParams<{ contestId: string }>();

  const [contestDetails, setContestDetails] = useState<IContest>(null);
  const [participants, setParticipants] = useState<I3ContestParticipants[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [approved,setApproved] = useState<boolean>(false);

  const countdown = useCountdown(contestDetails?.registrationDeadline || "");

  const getContestDetails = async () => {
    try {
      const res = await getAction(`/events/contest/${contestId}`);
      if (res.status === 200) {
        setContestDetails(res.data.contest);
        setParticipants(res.data.topParticipants);
        setApproved(res.data.contest.approved);
        setLoading(false)
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContestDetails();
  }, []);

  if (loading) return <ContestSkeleton />;

  if(!approved) return <NotFound/>

  return (
    <div className="contest_home__container">
        <div
            className="contest_home__dropdown"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, #141318 100%), url(${contestDetails.backdrop})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
            }}
        />
        <div className="contest_home">
            <div className="contest_general">
                <div className="contest_general__l1">
                    <div className="contest_general__title ff-kanit-n">{contestDetails.title}</div>
                    <div className="contest_general__tags">
                    <div className="contest_general__tag ff-google-n capitalize"><span className="ff-google-b">CP</span> {contestDetails.type}</div>
                    {contestDetails.type === 'tournament' && (<div className="contest_general__tag ff-google-n"><span className="ff-google-b">1V1</span> Contest</div>)}
                    <div className="contest_general__tag ff-google-n">{contestDetails.rated ? 'Rated' : 'Un-Rated'}</div>
                    </div>
                </div>
                <div className="contest_general__l2 ff-kanit-n">
                    Starts At {formattedDate(contestDetails.startDate).datePart} <span className="yellow">{formattedDate(contestDetails.startDate).timePart}</span>
                </div>
            </div>

            <div className="contest_host__details">
                <img src={contestDetails.host.meta.logo} alt="" />
                <div className="contest_host__details__name ff-google-n">Organized By {contestDetails.host.name}</div>
            </div>
            
            <div className="contest_action">
            <div className="contest_action__l1">
                <div 
                  className="contest_action__button ff-google-b pointer clickbutton"
                  onClick={()=>toast.message('Feature coming soon!!!😉')}
                >
                  Register Now
                </div>
                {participants.length > 0 && (
                <div className="participants_count">
                    <div className="profiles">
                    {participants.map((p) => (
                        <img key={p._id} src={p.profile_image} alt={p.name} />
                    ))}
                    </div>
                    <div className="count ff-google-n">{participants.length} Coders</div>
                </div>
                )}
            </div>
            <div className="contest_action__l2 ff-kanit-n">
                Registration Closes in {renderCountdown(countdown)}
            </div>
            </div>

            <div className="contest_languages">
            <div className="contest_languages__l1 ff-google-b">Languages Allowed</div>
            <div className="contest_languages__l2">
                {contestDetails.languages.map((lang) => (
                <div key={lang} className="contest_language glassmorphism-medium">
                    <img src={`/icons/languages/${lang.toLowerCase()}.svg`} alt={lang} />
                    {lang.toUpperCase()}
                </div>
                ))}
            </div>
            </div>

            <div className="contest_details">
                <div className="contest_details__l">
                    <div className="contest_details__header ff-google-b">About Event</div>
                    <div className="contest_details__desc ff-google-n">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <p style={{ marginBottom: "1em", lineHeight: 1.6 }}>{children}</p>,
                        }}
                    >
                        {contestDetails.desc}
                    </ReactMarkdown>
                    </div>
                </div>

                <div className="contest_details__l">
                    <div className="contest_details__header ff-google-b">Rules</div>
                    <div className="contest_details__desc ff-google-n">
                    <span className="ff-google-b">Duration - {contestDetails.duration} Min ({contestDetails.type==='contest' ? 'Total':'Per Round'})</span>
                    <span className="ff-google-b">Rounds - {contestDetails.rounds}</span>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <p style={{ marginBottom: "1em", lineHeight: 1.6 }}>{children}</p>,
                        }}
                    >
                        {contestDetails.rules}
                    </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const Skeleton = ({ className }: { className?: string }) => {
  return <div className={`skeleton ${className || ""}`} />;
};

const ContestSkeleton = () => (
  <div className="contest_home__container">
    <div className="contest_home">
      {/* Header */}
      <div className="contest_general">
        <div className="contest_general__l1">
          <Skeleton className="h-8 w-48 mb-2" /> {/* Title */}
          <div style={{ display: "flex", gap: "8px" }}>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <div className="contest_general__l2">
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
      </div>

      {/* Action / Countdown */}
      <div className="contest_action" style={{ marginTop: "16px" }}>
        <Skeleton className="h-10 w-40 mb-2" /> {/* Register button */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-5 w-48 mt-2" /> {/* Countdown */}
      </div>

      {/* Languages */}
      <div className="contest_languages" style={{ marginTop: "16px" }}>
        <Skeleton className="h-6 w-48 mb-2" /> {/* Label */}
        <div style={{ display: "flex", gap: "8px" }}>
          <Skeleton className="h-16 w-16 rounded-lg" />
          <Skeleton className="h-16 w-16 rounded-lg" />
          <Skeleton className="h-16 w-16 rounded-lg" />
        </div>
      </div>

      {/* About Event */}
      <div className="contest_details" style={{ marginTop: "16px" }}>
        <Skeleton className="h-6 w-32 mb-2" /> {/* Header */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-1" />

        {/* Rules */}
        <Skeleton className="h-6 w-24 mt-4 mb-2" /> {/* Header */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-1" />
      </div>
    </div>
  </div>
);

export default ContestHome;
