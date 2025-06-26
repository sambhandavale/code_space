import { useEffect, useState } from "react";
import DefaultProfile from "../../components/Layout/DefaultProfile";
import { getInitials } from "../../utility/general-utility";
import { getAction } from "../../services/generalServices";
import { IUserBlogSummary } from "../../interfaces/UserInterfaces";
import { useNavigate } from "react-router";

const AllBlogs = () => {
    const navigate = useNavigate();
    const [allBlogs, setAllBlogs] = useState<IUserBlogSummary[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);

    const blogsPerPage = 5;

    const filteredBlogs = allBlogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.firstContent.toLowerCase().includes(searchQuery.toLowerCase()) || 
        blog.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

    const paginatedBlogs = filteredBlogs.slice(
        (currentPage - 1) * blogsPerPage,
        currentPage * blogsPerPage
    );

    useEffect(() => {
        const getAllBlogs = async () => {
            try {
                const res = await getAction('/blogs');
                if(res.status === 200){
                    setAllBlogs(res.data);
                    setLoading(false)
                }
            } catch (err) {
                console.log(err);
            } finally{
                setLoading(false)
            }
        };

        getAllBlogs();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="explore__blogs">
            <header className="ff-kanit-n white">Explore Blogs</header>
            <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search your blog..."
                className="search_blogs glassmorphism-light ff-google-n white"
            />
            {!loading ? (
                <div className="blogs">
                    {paginatedBlogs.length > 0 ? (
                        paginatedBlogs.map((blog) => (
                            <div key={blog.id} className="blog pointer" onClick={() => navigate(`/blog/${blog.id}/${blog.slug}`)}>
                                <div className="blog_content">
                                    <div className="blog_header ff-google-b white">{blog.title}</div>
                                    <div className="blog_content ff-google-n white" style={{ opacity: "0.8" }}>
                                        {blog.firstContent.length > 60 ? `${blog.firstContent.slice(0, 60)}...` : blog.firstContent}
                                    </div>
                                </div>
                                {blog.author && (
                                    <div className="author pointer" onClick={() => navigate(`/profile/${blog.authorId?.username}`)}>
                                        <DefaultProfile initals={getInitials(blog.author)} />
                                        <div className="authorname ff-google-n white">{blog.author}</div>
                                    </div>
                                )}
                                <div className="blog_interaction">
                                    <div className="time ff-google-n white" style={{ opacity: "0.7" }}>{blog.publishedAgo} ago</div>
                                    <div className="time ff-google-n white">{blog.views} <span style={{ opacity: "0.7" }}>view<span style={blog.views > 10 ? { opacity: "1" } : { opacity: "0" }}>s</span></span></div>
                                    <div className="activity ff-google-n white">
                                        <img src="/icons/user/ping.svg" alt="" />
                                        <span style={{ opacity: "0.7" }}>{blog.pings}</span>
                                    </div>
                                    <div className="activity ff-google-n white">
                                        <img src="/icons/user/comment.svg" alt="" />
                                        <span style={{ opacity: "0.7" }}>{blog.comments}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="ff-google-n white" style={{ opacity: "0.7" }}>
                            No blogs found.
                        </div>
                    )}
                </div>
            ):(
                <BlogSkeleton/>
            )}

            {filteredBlogs.length > 0 && (
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
                        className="pagination-btn ff-google-n white"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

const BlogSkeleton = () => {
    return (
        <div className="skeleton_blogs flex flex-col gap-4" style={{alignSelf:"stretch"}}>
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="blog skeleton flex flex-col gap-2">
                    <div className="blog_content">
                        <div className="blog_header skeleton-box" style={{ width: "60%", height: "20px", marginBottom: "10px" }}></div>
                        <div className="blog_content skeleton-box" style={{ width: "90%", height: "15px" }}></div>
                    </div>

                    <div className="author">
                        <div className="skeleton-box" style={{ width: "40px", height: "40px", borderRadius: "50%" }}></div>
                        <div className="authorname skeleton-box" style={{ width: "80px", height: "15px" }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};


export default AllBlogs;
