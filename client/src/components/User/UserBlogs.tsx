import { useState } from "react";
import { useNavigate } from "react-router";
import { IProfileCardInfo, IUserBlogSummary } from "../../interfaces/UserInterfaces";
import { isAuth } from "../../utility/helper";

interface IUserBlogs {
    userBlogs: IUserBlogSummary[];
    userInfo: IProfileCardInfo | undefined;
    loading:boolean;
}

const UserBlogs = ({ userBlogs, userInfo, loading }: IUserBlogs) => {
    const navigate = useNavigate();

    const blogsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const itsMe = isAuth() ? userInfo?.username === isAuth().username : false;

    const filteredBlogs = userBlogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.firstContent.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

    const paginatedBlogs = filteredBlogs.slice(
        (currentPage - 1) * blogsPerPage,
        currentPage * blogsPerPage
    );

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <>
        {!loading ? (
            <div className="user_blogs">
                <header className="ff-google-n white">
                    <div className="header_text">{itsMe ? 'Your' : `${userInfo?.username}'s`} Blogs.</div>
                </header>

                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search your blog..."
                    className="search_blogs glassmorphism-light ff-google-n white"
                />

                <div className="blogs">
                    {paginatedBlogs.length > 0 ? (
                        paginatedBlogs.map((blog, index) => (
                            <div
                                key={blog.id}
                                className="blog pointer"
                                onClick={() => navigate(`/blog/${blog.id}/${blog.slug}`)}
                                style={index + 1 === paginatedBlogs.length ? { border: "none" } : {}}
                            >
                                <div className="blog_content">
                                    <div className="blog_header ff-google-b white">{blog.title}</div>
                                    <div className="blog_content ff-google-n white" style={{ opacity: "0.8" }}>
                                        {blog.firstContent.length > 60 ? `${blog.firstContent.slice(0, 60)}...` : blog.firstContent}
                                    </div>
                                </div>
                                <div className="blog_interaction">
                                    <div className="time ff-google-n white" style={{ opacity: "0.7" }}>{blog.publishedAgo} ago</div>
                                    <div className="time ff-google-n white">{blog.views} <span style={{ opacity: "0.7" }}>view<span style={blog.views > 10 ? {opacity:"1"} : {opacity:"0"}}>s</span></span></div>
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
        ):(
            <UserBlogsSkeleton/>
        )}
        </>
    );
};

const UserBlogsSkeleton = () => {
    return (
        <div className="user_blogs">
            {/* Header Skeleton */}
            <div className="skeleton-box" style={{ width: "200px", height: "25px", marginBottom: "20px" }}></div>

            {/* Search Bar Skeleton */}
            <div className="skeleton-box" style={{ width: "100%", height: "40px", marginBottom: "20px", borderRadius: "8px" }}></div>

            {/* Blog Cards Skeleton */}
            <div className="blogs">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="blog pointer" style={{ marginBottom: "20px" }}>
                        <div className="blog_content">
                            <div className="skeleton-box" style={{ width: "60%", height: "20px", marginBottom: "10px" }}></div>
                            <div className="skeleton-box" style={{ width: "90%", height: "15px" }}></div>
                        </div>

                        <div className="blog_interaction flex gap-4 mt-4">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="activity ff-google-n white flex gap-2">
                                    <div className="skeleton-box" style={{ width: "20px", height: "20px", borderRadius: "4px" }}></div>
                                    <div className="skeleton-box" style={{ width: "30px", height: "15px" }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="pagination-controls flex justify-center gap-4 mt-6">
                <div className="skeleton-box" style={{ width: "80px", height: "30px", borderRadius: "6px" }}></div>
                <div className="skeleton-box" style={{ width: "50px", height: "20px", borderRadius: "4px" }}></div>
                <div className="skeleton-box" style={{ width: "80px", height: "30px", borderRadius: "6px" }}></div>
            </div>
        </div>
    );
};


export default UserBlogs;
