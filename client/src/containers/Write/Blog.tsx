import { useEffect, useState } from "react";
import { calculateReadingTime, languages, Section } from "./WriteBlog";
import { getAction, postAction } from "../../services/generalServices";
import DefaultProfile from "../../components/Layout/DefaultProfile";
import { getInitials } from "../../utility/general-utility";
import { useNavigate, useParams } from "react-router";
import { isAuth } from "../../utility/helper";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import CodeBlockEditor from "../../components/Write/CodeBlockEditor";
import { FiTrash } from "react-icons/fi";

const Blog = () =>{
    const { id, slug } = useParams<{ id: string; slug: string }>();
    const navigate = useNavigate()

    const [loading, setLoading] = useState<boolean>(true)
    const [sections, setSections] = useState<Section[]>([]);
    const [blogTitle,setBlogTitle] = useState<string>('');
    const [blogDate, setBlogDate] = useState<string>('');
    const [blogAuthorDetails, setBlogAuthorDetails] = useState<{id:string,full_name:string,username:string}>();
    const [blogAuthor, setBlogAuthor] = useState<string>('');


    const [showPingText, setShowPingText] = useState(false);
    const [hasPinged, setHasPinged] = useState<boolean>(false);
    const [blogPingsNo, setBlogPingsNo] = useState<number>(0);
    const [blogViews, setBlogViews] = useState<number>(0);


    const getBlog = async () =>{
        try{
            let res;
            if(isAuth()){
                res = await getAction(`/blogs/${id}?userId=${isAuth()._id}`);
            } else{
                res = await getAction(`/blogs/${id}`);
            }
            if(res && res.status === 200){
                setSections(res.data.blog.sections);
                setBlogTitle(res.data.blog.title);
                setBlogAuthorDetails(res.data.blog.authorId);
                setBlogAuthor(res.data.blog.author);
                setHasPinged(res.data.hasPinged);
                setBlogPingsNo(res.data.pingCount);
                setBlogViews(res.data.viewsCount);

                const date = new Date(res.data.blog.createdAt);

                const options: Intl.DateTimeFormatOptions = {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                };

                const formattedDate = date.toLocaleString('en-US', options);
                setBlogDate(formattedDate);

                if(isAuth() && !res.data.hasViewed){
                    addView();
                }

                setLoading(false);
            }
        }catch(err){
            console.log(err);
        }
    }

    const pingBlog = async () => {
        try {
            // Optimistic update
            setHasPinged(true);
            setBlogPingsNo((prev) => prev + 1);
            triggerPingAnimation();

            const res = await postAction(`/blogs/ping/${id}`, {});

            if (!(res && res.status === 200)) {
                // Revert if API fails
                setHasPinged(false);
                setBlogPingsNo((prev) => prev - 1);
                toast.error(res.data.error || 'Failed to ping the blog.');
            }

        } catch (err) {
            console.log(err);
            // Revert if API fails
            setHasPinged(false);
            setBlogPingsNo((prev) => prev - 1);
            toast.error('An error occurred while pinging the blog.');
        }
    };


    const addView = async () => {
        try {
            const res = await postAction(`/blogs/view/${id}?userId=${isAuth()._id}`, {});
        } catch (err) {
            console.log(err);
            toast.error('An error occurred while pinging the blog.');
        }
    };


    const triggerPingAnimation = () => {
        setShowPingText(true);
        setTimeout(() => {
            setShowPingText(false);
        }, 1000);
    };

    const unpingBlog = async () => {
        try {
            // Optimistic update
            setHasPinged(false);
            setBlogPingsNo((prev) => prev - 1);

            const res = await postAction(`/blogs/unping/${id}`, {});

            if (!(res && res.status === 200)) {
                // Revert if API fails
                setHasPinged(true);
                setBlogPingsNo((prev) => prev + 1);
                toast.error(res.data.error || 'Failed to unping the blog.');
            }

        } catch (err) {
            console.log(err);
            // Revert if API fails
            setHasPinged(true);
            setBlogPingsNo((prev) => prev + 1);
            toast.error('An error occurred while unpinging the blog.');
        }
    };


    const addComment = async (commentText: string) => {
        if (!commentText.trim()) {
            toast.error('Comment cannot be empty.');
            return;
        }

        try {
            const res = await postAction(`/blogs/${id}/comment`, { text: commentText });

            if (res && res.status === 201) {
                toast.success('Comment added!');
                // Optionally refetch blog to update comments
                getBlog();
            } else {
                toast.error(res.data.error || 'Failed to add comment.');
            }
        } catch (err) {
            console.log(err);
            toast.error('An error occurred while adding the comment.');
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            const res = await postAction(`/blogs/${id}/comment/${commentId}/delete`, {});

            if (res && res.status === 200) {
                toast.success('Comment deleted!');
                // Optionally refetch blog to update comments
                getBlog();
            } else {
                toast.error(res.data.error || 'Failed to delete comment.');
            }
        } catch (err) {
            console.log(err);
            toast.error('An error occurred while deleting the comment.');
        }
    };

    

    useEffect(()=>{
        if(blogTitle === ''){
            getBlog();
        }
    },[])

    return(
        <>
            {!loading ? (
                <div className="write__blog__wrapper">
                    <div className="write__blog">
                        <div className="blog__header">
                            <div className="blog__date">{blogDate}</div>
                            <div
                                className="blog__main__header"
                            >
                                {blogTitle}
                            </div>
                        </div>

                        <div className="blog__actions">
                            <div className="blog__author pointer" onClick={()=>navigate(`/profile/${blogAuthorDetails?.username}`)}>
                                <DefaultProfile initals={getInitials(`${blogAuthor}`)}/>
                                <div className="blog__details">
                                    <div className="author__name">{blogAuthor}</div>
                                    <div className="blog__read__time">{calculateReadingTime(sections)} min read</div>
                                </div>
                            </div>
                            <div className="blog_interaction">
                                <div 
                                    className="activity ff-google-n white" 
                                >
                                    {blogViews} views
                                </div>
                                <div 
                                    className="activity ff-google-n white pointer" 
                                    onClick={hasPinged ? unpingBlog : pingBlog}
                                    style={isAuth() ? {} : {pointerEvents:"none"}}
                                >
                                    <img 
                                        src={hasPinged ? '/icons/user/pinged.svg' : "/icons/user/ping.svg"} 
                                        alt="ping" 
                                    />
                                    <span style={{ opacity: hasPinged ? '1' : '0.7' }}>{blogPingsNo}</span>
                                </div>
                                {isAuth() && (
                                    isAuth()._id === blogAuthorDetails?.id &&
                                    <div className="actions">
                                        <div className="save__draft glassmorphism-medium gls-box pointer" onClick={()=>navigate(`/blog/write?editid=${id}`)}>Edit Blog</div>
                                    </div>  
                                )}

                                <AnimatePresence>
                                    {showPingText && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="ping-animation"
                                        >
                                            Pingggg!
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>



                        <div className="blog__content">
                            {sections.map((section, sectionIndex) => (
                                <div
                                    key={sectionIndex}
                                    className="section"
                                >
                                    {section.header !== undefined && (
                                        <div className="section__header__wrapper">
                                            <div
                                                className="section__header"
                                            >
                                                {section.header || "Enter your section header here..."}
                                            </div>
                                        </div>
                                    )}

                                    {section.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="content">
                                            {item.type === "content" && (
                                                <div className="content__wrapper">
                                                    <div
                                                        className="content__input"
                                                    >
                                                        {item.value !== '' ? item.value : <br/>}
                                                    </div>
                                                </div>
                                            )}

                                            {item.type === "bullet" && (
                                                <div className="bullet__point">
                                                    <div className="bullet__wrapper">
                                                        <div
                                                            className="bullet__input"
                                                        >
                                                            • {item.value ? item.value : '\u200B'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {item.type === "code" && (
                                                <div className="code-editor-wrapper">
                                                    <div className="code-editor">
                                                        <div className="code-toolbar">
                                                            <>
                                                            <span className="readonly-label ff-google-n">{item.language || 'plaintext'}</span>
                                                            <span className="readonly-label ff-google-n">{item.theme || 'vs-dark'}</span>
                                                            </>
                                                        </div>

                                                        <CodeBlockEditor
                                                            value={item.value}
                                                            language={item.language?.toLowerCase() || 'plaintext'}
                                                            onChange={() => {}}
                                                            theme={item.theme || 'vs-dark'}
                                                            editing={false}
                                                        />

                                                    </div>
                                                </div>
                                            )} 

                                            {item.type === "image" && (
                                                <div className="image__wrapper">
                                                    <div
                                                        className="content__image"
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                item.align === "center"
                                                                    ? "center"
                                                                    : item.align === "end"
                                                                    ? "flex-end"
                                                                    : "flex-start"
                                                        }}
                                                    >
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.imageAlt}
                                                            style={{
                                                                maxWidth: "100%",
                                                                maxHeight: item.expanded ? "100%" : "400px",
                                                                transition: "max-height 0.3s ease"
                                                            }}
                                                        />
                                                    </div>
                                                </div> 
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            ):(
                <BlogViewSkeleton/>
            )}
        </>
    )
}

const BlogViewSkeleton = () => {
    return (
        <div className="write__blog__wrapper">
            <div className="write__blog">
                {/* Blog Header Skeleton */}
                <div className="blog__header">
                    <div className="skeleton-box" style={{ width: "100px", height: "15px", marginBottom: "10px" }}></div>
                    <div className="skeleton-box" style={{ width: "60%", height: "30px" }}></div>
                </div>

                {/* Blog Author Section Skeleton */}
                <div className="blog__actions">
                    <div className="blog__author">
                        <div className="blog__details">
                            <div className="skeleton-box" style={{ width: "100px", height: "15px", marginBottom: "5px" }}></div>
                            <div className="skeleton-box" style={{ width: "60px", height: "12px" }}></div>
                        </div>
                    </div>

                    {/* Blog Interaction Skeleton */}
                    <div className="blog_interaction">
                        <div className="activity skeleton-box" style={{ width: "50px", height: "12px" }}></div>
                        <div className="activity skeleton-box" style={{ width: "50px", height: "12px" }}></div>
                        <div className="activity skeleton-box" style={{ width: "50px", height: "12px" }}></div>
                    </div>
                </div>

                {/* Blog Content Skeleton */}
                <div className="blog__content">
                    {Array.from({ length: 4 }).map((_, sectionIndex) => (
                        <div key={sectionIndex} className="section">
                            <div className="section__header__wrapper">
                                <div className="skeleton-box" style={{ width: "40%", height: "20px", marginBottom: "10px" }}></div>
                            </div>

                            {Array.from({ length: 2 }).map((_, itemIndex) => (
                                <div key={itemIndex} className="content">
                                    <div className="content__wrapper">
                                        <div className="skeleton-box" style={{ width: "100%", height: "15px", marginBottom: "8px" }}></div>
                                        <div className="skeleton-box" style={{ width: "90%", height: "15px", marginBottom: "8px" }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


export default Blog;