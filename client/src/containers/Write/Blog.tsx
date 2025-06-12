import { useEffect, useState } from "react";
import { calculateReadingTime, Section } from "./WriteBlog";
import { getAction, postAction } from "../../services/generalServices";
import Layout from "../../components/Layout/Layout";
import DefaultProfile from "../../components/Layout/DefaultProfile";
import { getInitials } from "../../utility/general-utility";
import { useNavigate, useParams } from "react-router";
import { isAuth } from "../../utility/helper";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Blog = () =>{
    const { id, slug } = useParams<{ id: string; slug: string }>();
    const navigate = useNavigate()

    const [loading, setLoading] = useState<boolean>()
    const [sections, setSections] = useState<Section[]>([]);
    const [blogTitle,setBlogTitle] = useState<string>('');
    const [blogDate, setBlogDate] = useState<string>('');
    const [blogAuthor, setBlogAuthor] = useState<string>('');
    const [blogAuthorId, setBlogAuthorId] = useState<string>('');

    const [showPingText, setShowPingText] = useState(false);
    const [blogPings, setBlogPings] = useState<string[]>([]);
    const [blogPingsNo, setBlogPingsNo] = useState<number>(0);
    const userId = isAuth()?._id;
    const hasPinged = blogPings.includes(userId);


    const getBlog = async () =>{
        try{
            const res = await getAction(`/blogs/${id}`);
            if(res && res.status === 200){
                setSections(res.data.sections);
                setBlogTitle(res.data.title);
                setBlogAuthor(res.data.author);
                setBlogAuthorId(res.data.authorId);
                setBlogPings(res.data.pings);
                setBlogPingsNo(res.data.pings.length);

                const date = new Date(res.data.createdAt);

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

                setLoading(false);
            }
        }catch(err){
            console.log(err);
        }
    }

    const pingBlog = async () => {
        try {
            const res = await postAction(`/blogs/ping/${id}`, {});
            if (res && res.status === 200) {

                setBlogPings((prev) => [...prev, isAuth()._id]);
                setBlogPingsNo((prev) => prev + 1);
                triggerPingAnimation();
            } else {
                toast.error(res.data.error || 'Failed to ping the blog.');
            }
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
            const res = await postAction(`/blogs/unping/${id}`, {});

            if (res && res.status === 200) {
                getBlog();
            } else {
                toast.error(res.data.error || 'Failed to unping the blog.');
            }
        } catch (err) {
            console.log(err);
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
        getBlog();
    },[])

    return(
        <Layout>
            {!loading && (
                <div className="write__blog">
                    {isAuth() && (
                        isAuth()._id === blogAuthorId &&
                        <div className="actions">
                            <div className="save__draft glassmorphism-medium gls-box pointer" onClick={()=>navigate(`/blog/write?editid=${slug}`)}>Edit Blog</div>
                        </div>  
                    )}
                    <div className="blog__header">
                        <div className="blog__date">{blogDate}</div>
                        <div
                            className="blog__main__header"
                        >
                            {blogTitle}
                        </div>
                    </div>

                    <div className="blog__actions">
                        <div className="blog__author">
                            <DefaultProfile initals={getInitials(`${blogAuthor}`)}/>
                            <div className="blog__details">
                                <div className="author__name">{blogAuthor}</div>
                                <div className="blog__read__time">{calculateReadingTime(sections)} min read</div>
                            </div>
                        </div>
                        <div className="blog_interaction">
                            <div 
                                className="activity ff-google-n white pointer" 
                                onClick={hasPinged ? unpingBlog : pingBlog}
                            >
                                <img 
                                    src={"/icons/user/ping.svg"} 
                                    alt="ping" 
                                />
                                <span style={{ opacity: hasPinged ? '1' : '0.7' }}>{blogPingsNo}</span>
                            </div>

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

                                        {item.type === "image" && (
                                            <div className="image__wrapper">
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.imageAlt} 
                                                    style={{maxWidth: "100%", maxHeight: "400px"}}
                                                />
                                                {/* <div
                                                    className="image__caption"
                                                    contentEditable
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => {
                                                        const updatedSections = [...sections];
                                                        updatedSections[sectionIndex].items[itemIndex].imageAlt = 
                                                            (e.target as HTMLDivElement).innerText;
                                                        setSections(updatedSections);
                                                    }}
                                                >
                                                    {item.imageAlt || "Enter image description..."}
                                                </div> */}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </Layout>
    )
}

export default Blog;