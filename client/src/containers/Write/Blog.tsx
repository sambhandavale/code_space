import { useEffect, useState } from "react";
import { calculateReadingTime, Section } from "./WriteBlog";
import { getAction } from "../../services/generalServices";
import Layout from "../../components/Layout/Layout";
import DefaultProfile from "../../components/Layout/DefaultProfile";
import { getInitials } from "../../utility/general-utility";

const Blog = () =>{
    const [loading, setLoading] = useState<boolean>()
    const [sections, setSections] = useState<Section[]>([]);
    const [blogTitle,setBlogTitle] = useState<string>('');
    const [blogDate, setBlogDate] = useState<string>('');
    const [blogAuthor, setBlogAuthor] = useState<string>('');

    const getBlog = async () =>{
        try{
            const res = await getAction('/blogs/slug/codespace');
            if(res && res.status === 200){
                setSections(res.data.sections);
                setBlogTitle(res.data.title);
                setBlogAuthor(res.data.author);

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

    useEffect(()=>{
        getBlog();
    },[])

    return(
        <Layout>
            {!loading && (
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
                        <div className="blog__author">
                            <DefaultProfile initals={getInitials(`${blogAuthor}`)}/>
                            <div className="blog__details">
                                <div className="author__name">{blogAuthor}</div>
                                <div className="blog__read__time">{calculateReadingTime(sections)} min read</div>
                            </div>
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