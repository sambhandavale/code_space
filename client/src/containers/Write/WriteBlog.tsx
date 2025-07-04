import React, { useState, useRef, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import {FiTrash } from "react-icons/fi";
import DefaultProfile from "../../components/Layout/DefaultProfile";
import { getInitials } from "../../utility/general-utility";
import { isAuth } from "../../utility/helper";
import { toast } from "sonner";
import { getAction, postAction, putAction } from "../../services/generalServices";
import { useLocation, useNavigate } from "react-router";

type ItemType = "content" | "bullet" | "image";

interface Item {
    type: ItemType;
    value: string;
    imageUrl?: string;
    imageAlt?: string;
}

export interface Section {
    header?: string;
    items: Item[];
}

export const calculateReadingTime = (sections: Section[]): number => {
    let totalWords = 0;
    
    sections.forEach(section => {
        if (section.header) {
            totalWords += section.header.trim().split(/\s+/).length;
        }
        
        section.items.forEach(item => {
            if (item.value) {
                totalWords += item.value.trim().split(/\s+/).length;
            }
        });
    });
    
    // Average reading speed is 200 words per minute
    const wordsPerMinute = 100;
    return Math.ceil(totalWords / wordsPerMinute);
};

const WriteBlog: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const slug = queryParams.get('editid');
    const navigate = useNavigate();

    const [loading, setloading] = useState<boolean>(true);
    const [sections, setSections] = useState<Section[]>([
        { items: [] }
    ]);
    const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(0);
    const [blogHeader, setBlogHeader] = useState<string>('');
    const [tempBlogHeader, setTempBlogHeader] = useState<string>('');
    const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [currentDateTime, setCurrentDateTime] = useState<string>("");

    useEffect(()=>{
        const getBlogDetails = async () =>{
            try{
                const res = await getAction(`/blogs/slug/${slug}`);
                setSections(res.data.sections);
                setTempBlogHeader(res.data.title);
                setBlogHeader(res.data.title);
                setloading(false);
            }catch(err){
                console.log(err);
            }finally{
                setloading(false);
            }
        }

        if(slug){
            getBlogDetails();
        } else{
            setloading(false);
        }
    },[])

    useEffect(() => {
        const now = new Date();

        const options: Intl.DateTimeFormatOptions = {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        };

        // This gives format like: July 25, 2025, 11:15 PM
        let formatted = now.toLocaleString("en-US", options);

        // Add "th", "st", "nd", "rd" to the day
        const day = now.getDate();
        const daySuffix = getDaySuffix(day);
        formatted = formatted.replace(`${day}`, `${day}${daySuffix}`);

        setCurrentDateTime(formatted);
    }, []);

    const handleImageUpload = (sectionIndex: number, file: File) => {
        // Here you would typically upload the image to a server
        // For now, we'll just create a local URL
        const imageUrl = URL.createObjectURL(file);
        
        const updatedSections = [...sections];
        updatedSections[sectionIndex].items.push({
            type: "image",
            value: "",
            imageUrl,
            imageAlt: "Enter image description..."
        });
        
        setSections(updatedSections);
    };

    const getDaySuffix = (day: number) => {
        if (day > 3 && day < 21) return "th"; // covers 11th, 12th, 13th
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    const addHeader = () => {
        let sectionIndex = activeSectionIndex;

        if (sectionIndex === null || sections.length === 0) {
            const newSection: Section = { header: "", items: [] };
            setSections(prev => [...prev, newSection]);
            setActiveSectionIndex(sections.length);
            return;
        }

        const currentSection = sections[sectionIndex];

        if (!currentSection.header && currentSection.items.length === 0) {
            const updatedSections = [...sections];
            updatedSections[sectionIndex].header = "";
            setSections(updatedSections);
            return;
        }

        const newSection: Section = { header: "", items: [] };
        setSections(prev => [...prev, newSection]);
        setActiveSectionIndex(sections.length);
    };

    const addItem = (
        type: ItemType,
        sectionIndex?: number,
        insertAfterIndex?: number,
        onAddFocus?: (newItemIndex: number, sectionIndex: number) => void
    ) => {
        const defaultText = type === "content" ? "" : "";
        let updatedSections = [...sections];

        if (activeSectionIndex === null || sections.length === 0) {
            const newSection: Section = { items: [{ type, value: defaultText }] };
            updatedSections.push(newSection);
            setSections(updatedSections);
            setActiveSectionIndex(updatedSections.length - 1);
            return;
        }

        const targetSection = sectionIndex !== undefined ? sectionIndex : activeSectionIndex;

        if (insertAfterIndex !== undefined) {
            updatedSections[targetSection].items.splice(insertAfterIndex + 1, 0, { type, value: defaultText });
            setSections(updatedSections);

            setTimeout(() => {
                onAddFocus?.(insertAfterIndex + 1, targetSection);
            }, 0);
        } else {
            updatedSections[targetSection].items.push({ type, value: defaultText });
            setSections(updatedSections);

            setTimeout(() => {
                onAddFocus?.(updatedSections[targetSection].items.length - 1, targetSection);
            }, 0);
        }
    };

    const updateHeader = (index: number, html: string) => {
        const updatedSections = [...sections];
        updatedSections[index].header = html;
        setSections(updatedSections);
    };

    const updateItem = (sectionIndex: number, itemIndex: number, html: string) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].items[itemIndex].value = html;
        setSections(updatedSections);
    };

    const placeCaretAtEnd = (el: HTMLDivElement | null) => {
        if (!el) return;

        const range = document.createRange();
        const selection = window.getSelection();

        range.selectNodeContents(el);
        range.collapse(false); // Move range to the end

        selection?.removeAllRanges();
        selection?.addRange(range);
    };

    useEffect(() => {
        const savedDraft = localStorage.getItem('blogDraft');
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            setBlogHeader(draft.blogHeader || '');
            setSections(draft.sections || [{ items: [] }]);
        }
    }, []);

    const saveDraft = () => {
        const draft = {
            blogHeader,
            sections,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem('blogDraft', JSON.stringify(draft));
        toast.message('Draft saved successfully!');
    };

    const publishBlog = async () => {
        try {
            if (!blogHeader.trim()) {
                toast.error('Title cannot be empty.');
                return;
            }

            if (blogHeader.length < 5) {
                toast.error('Title should be at least 5 characters long.');
                return;
            }

            if (/[\/\\]/.test(blogHeader)) { // Checks for slashes
                toast.error('Title cannot contain slashes or backslashes.');
                return;
            }

            if (blogHeader.length > 100) { // Optional: Limit title length
                toast.error('Title should be less than 100 characters.');
                return;
            }

            if (sections.length === 0 || sections.every(section => section.items.length === 0)) {
                toast.error('Blog content cannot be empty.');
                return;
            }

            const data = {
                title: blogHeader,
                author: isAuth().full_name,
                authorId: isAuth()._id,
                sections: sections,
                isPublished: true,
                tags: [],
                coverImage: "",
            };

            const res = await postAction('/blogs/create', data);
            if (res.status === 201) {
                localStorage.removeItem('blogDraft');
                navigate(`/blog/${res.data._id}/${res.data.slug}`)
                toast.success('Published!!!'); 
            } else if (res.status === 400) {
                console.log(res);
                toast.error(res.data.error);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const updateBlog = async () => {
        try {
            if (!blogHeader.trim()) {
                toast.error('Title cannot be empty.');
                return;
            }

            if (blogHeader.length < 5) {
                toast.error('Title should be at least 5 characters long.');
                return;
            }

            if (/[\/\\]/.test(blogHeader)) { // Checks for slashes
                toast.error('Title cannot contain slashes or backslashes.');
                return;
            }

            if (blogHeader.length > 100) { // Optional: Limit title length
                toast.error('Title should be less than 100 characters.');
                return;
            }

            if (sections.length === 0 || sections.every(section => section.items.length === 0)) {
                toast.error('Blog content cannot be empty.');
                return;
            }

            const data = {
                title: blogHeader,
                author: isAuth().full_name,
                sections: sections,
                isPublished: true,
                tags: [],
                coverImage: "",
            };

            const res = await putAction(`/blogs/update/${slug}`, data);
            if (res.status === 200) {
                localStorage.removeItem('blogDraft');
                toast.success('Updated!!!');
            } else if (res.status === 400) {
                console.log(res);
                toast.error(res.data.error);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            {!loading && (
                <div className="write__blog"> 
                    {
                        isAuth() ? (
                            <div className="actions">
                                <div className="save__draft glassmorphism-medium gls-box pointer" onClick={saveDraft}>Save Draft</div>
                                <div className="publish__blog glassmorphism-medium gls-box pointer" onClick={slug ? updateBlog : publishBlog}>{slug ? "Update" : 'Publish'}</div>
                            </div>
                        ):(
                            <div className="actions">
                                <div className="save__draft glassmorphism-medium gls-box pointer" onClick={()=>navigate('/login')}>Login to Draft</div>
                            </div>
                        )
                    }

                    <div className="blog__header">
                        <div className="blog__date">{currentDateTime}</div>
                        <div
                            className="blog__main__header"
                            contentEditable
                            suppressContentEditableWarning={true}
                            onInput={(e) => setBlogHeader((e.target as HTMLDivElement).innerText)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addItem("content");
                                }
                            }}
                            data-placeholder="Enter your blog header here..."
                        >
                            {tempBlogHeader}
                        </div>
                    </div>
                    
                    {
                        isAuth() && (
                        <div className="blog__actions">
                            <div className="blog__author">
                                <DefaultProfile initals={getInitials(`${isAuth().full_name}`)}/>
                                <div className="blog__details">
                                    <div className="author__name">{isAuth().full_name}</div>
                                    <div className="blog__read__time">{calculateReadingTime(sections)} min read</div>
                                </div>
                            </div>
                        </div>
                        )
                    }



                    <div className="blog__content">
                        {sections.length === 0 && (
                            <div className="blog__builder sticky-builder">
                                <FiPlusCircle className="plus" />
                                <div className="blog__builder__options">
                                    <div
                                        className="blog__builder__option glassmorphism-medium header pointer"
                                        onClick={addHeader}
                                    >
                                        <strong>H</strong>eader
                                    </div>
                                    <div
                                        className="blog__builder__option glassmorphism-medium pointer"
                                        onClick={addHeader}
                                    >
                                        <strong>N</strong>ew Section
                                    </div>
                                    <div
                                        className="blog__builder__option glassmorphism-medium pointer"
                                        onClick={() => addItem("content", 0)}
                                    >
                                        New Line(Content)
                                    </div>
                                    <div
                                        className="blog__builder__option glassmorphism-medium pointer"
                                        onClick={() => addItem("bullet", 0)}
                                    >
                                        • Bullet Point
                                    </div>
                                </div>
                            </div>
                        )}
                        {sections.map((section, sectionIndex) => (
                            <div
                                key={sectionIndex}
                                className="section"
                                onClick={() => setActiveSectionIndex(sectionIndex)}
                            >
                                {activeSectionIndex === sectionIndex && (
                                    <div className="blog__builder sticky-builder">
                                        <FiPlusCircle className="plus" />
                                        <div className="blog__builder__options">
                                            <div
                                                className="blog__builder__option glassmorphism-medium header pointer"
                                                onClick={addHeader}
                                            >
                                                <strong>H</strong>eader
                                            </div>
                                            <div
                                                className="blog__builder__option glassmorphism-medium pointer"
                                                onClick={addHeader}
                                            >
                                                <strong>N</strong>ew Section
                                            </div>
                                            <div
                                                className="blog__builder__option glassmorphism-medium pointer"
                                                onClick={() => addItem("content", sectionIndex)}
                                            >
                                                New Line(Content)
                                            </div>
                                            <div
                                                className="blog__builder__option glassmorphism-medium pointer"
                                                onClick={() => addItem("bullet", sectionIndex)}
                                            >
                                                • Bullet Point
                                            </div>
                                        </div>
                                        {/* <div className="blog__builder__option glassmorphism-medium pointer">
                                            <label htmlFor={`image-upload-${sectionIndex}`} style={{cursor: "pointer"}}>
                                                Image
                                            </label>
                                            <input
                                                id={`image-upload-${sectionIndex}`}
                                                type="file"
                                                accept="image/*"
                                                style={{display: "none"}}
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleImageUpload(sectionIndex, e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </div> */}
                                    </div>
                                )}

                                {section.header !== undefined && (
                                    <div className="section__header__wrapper">
                                        <div
                                            className="section__header"
                                            contentEditable
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => updateHeader(sectionIndex, (e.target as HTMLDivElement).innerText)}
                                            onClick={() => setActiveSectionIndex(sectionIndex)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addItem("content", sectionIndex, -1);
                                                    setTimeout(() => {
                                                        const refKey = `${sectionIndex}-${0}`;
                                                        const el = contentRefs.current[refKey];
                                                        el?.focus();
                                                        placeCaretAtEnd(el);
                                                    }, 0);
                                                }
                                            }}
                                            data-placeholder="Enter your section header here..."
                                        >
                                            {section.header || ""}
                                        </div>
                                        <FiTrash
                                            className="delete__icon"
                                            onClick={() => {
                                                const updatedSections = [...sections];
                                                updatedSections.splice(sectionIndex, 1);
                                                setSections(updatedSections);
                                            }}
                                        />
                                    </div>
                                )}

                                {section.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="content">
                                        {item.type === "content" && (
                                            <div className="content__wrapper">
                                                <div
                                                    className="content__input"
                                                    contentEditable
                                                    suppressContentEditableWarning={true}
                                                    data-placeholder="Enter your content here..."
                                                    onBlur={(e) =>
                                                        updateItem(
                                                            sectionIndex,
                                                            itemIndex,
                                                            (e.target as HTMLDivElement).innerText.replace(/\u200B/g, '')
                                                        )
                                                    }
                                                    onClick={() => setActiveSectionIndex(sectionIndex)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            addItem("content", sectionIndex, itemIndex, (newItemIndex, targetSection) => {
                                                                const refKey = `${targetSection}-${newItemIndex}`;
                                                                const el = contentRefs.current[refKey];
                                                                el?.focus();
                                                                placeCaretAtEnd(el);
                                                            });
                                                        }

                                                        if (e.key === "Backspace" && (e.target as HTMLDivElement).innerText.trim() === "") {
                                                            e.preventDefault();
                                                            if (sections[sectionIndex].items.length === 1) return;

                                                            const updatedSections = [...sections];
                                                            updatedSections[sectionIndex].items.splice(itemIndex, 1);
                                                            setSections(updatedSections);

                                                            const prevIndex = itemIndex - 1;
                                                            if (prevIndex >= 0) {
                                                                const refKey = `${sectionIndex}-${prevIndex}`;
                                                                setTimeout(() => {
                                                                    const el = contentRefs.current[refKey];
                                                                    el?.focus();
                                                                    placeCaretAtEnd(el);
                                                                }, 0);
                                                            }
                                                        }
                                                    }}
                                                    ref={(el) => {
                                                        contentRefs.current[`${sectionIndex}-${itemIndex}`] = el;
                                                    }}
                                                >
                                                    {item.value || ''}
                                                </div>
                                                <FiTrash
                                                    className="delete__icon"
                                                    onClick={() => {
                                                        const updatedSections = [...sections];
                                                        updatedSections[sectionIndex].items.splice(itemIndex, 1);
                                                        setSections(updatedSections);
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {item.type === "bullet" && (
                                            <div className="bullet__point">
                                                <div className="bullet__wrapper">
                                                    <span className="bullet__symbol">•</span>
                                                    <div
                                                        className="bullet__input"
                                                        contentEditable
                                                        suppressContentEditableWarning={true}
                                                        onBlur={(e) =>
                                                            updateItem(
                                                                sectionIndex,
                                                                itemIndex,
                                                                (e.target as HTMLDivElement).innerText.trim()
                                                            )
                                                        }
                                                        onClick={() => setActiveSectionIndex(sectionIndex)}
                                                        onKeyDown={(e) => {
                                                            const currentText = (e.target as HTMLDivElement).innerText.trim();

                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                addItem("bullet", sectionIndex, itemIndex, (newItemIndex, targetSection) => {
                                                                    const refKey = `${targetSection}-${newItemIndex}`;
                                                                    const el = contentRefs.current[refKey];
                                                                    el?.focus();
                                                                    placeCaretAtEnd(el);
                                                                });
                                                            }

                                                            if (e.key === "Backspace" && currentText === "") {
                                                                e.preventDefault();

                                                                if (sections[sectionIndex].items.length === 1) return;

                                                                const updatedSections = [...sections];
                                                                updatedSections[sectionIndex].items.splice(itemIndex, 1);
                                                                setSections(updatedSections);

                                                                const prevIndex = itemIndex - 1;
                                                                if (prevIndex >= 0) {
                                                                    const refKey = `${sectionIndex}-${prevIndex}`;
                                                                    setTimeout(() => {
                                                                        const el = contentRefs.current[refKey];
                                                                        el?.focus();
                                                                        placeCaretAtEnd(el);
                                                                    }, 0);
                                                                }
                                                            }
                                                        }}
                                                        ref={(el) => {
                                                            contentRefs.current[`${sectionIndex}-${itemIndex}`] = el;
                                                        }}
                                                        data-placeholder="Enter your bullet point here..."
                                                    >
                                                        {item.value || ''}
                                                    </div>

                                                    <FiTrash
                                                        className="delete__icon"
                                                        onClick={() => {
                                                            const updatedSections = [...sections];
                                                            updatedSections[sectionIndex].items.splice(itemIndex, 1);
                                                            setSections(updatedSections);
                                                        }}
                                                    />
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
                                                <FiTrash
                                                    className="delete__icon pointer"
                                                    onClick={() => {
                                                        const updatedSections = [...sections];
                                                        updatedSections[sectionIndex].items.splice(itemIndex, 1);
                                                        setSections(updatedSections);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </>
    );
};

export default WriteBlog;
