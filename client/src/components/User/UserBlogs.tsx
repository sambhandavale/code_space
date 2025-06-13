import { useState } from "react";
import { useNavigate } from "react-router";
import { IProfileCardInfo, IUserBlogSummary } from "../../interfaces/UserInterfaces";
import { isAuth } from "../../utility/helper";

interface IUserBlogs {
    userBlogs: IUserBlogSummary[];
    userInfo: IProfileCardInfo;
}

const UserBlogs = ({ userBlogs, userInfo }: IUserBlogs) => {
    const navigate = useNavigate();

    const blogsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const itsMe = isAuth() ? userInfo.username === isAuth().username : false;

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
        setCurrentPage(1); // Reset to first page on new search
    };

    return (
        <div className="user_blogs">
            <header className="ff-google-n white">
                <div className="header_text">{itsMe ? 'Your' : `${userInfo.username}'s`} Blogs</div>
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
                                <div className="time ff-google-n white" style={{ opacity: "0.7" }}>{blog.publishedAgo}</div>
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
    );
};

export default UserBlogs;
