import React, { useState, useRef, useEffect } from "react";
import { FiImage, FiPlusCircle } from "react-icons/fi";
import {FiTrash } from "react-icons/fi";
import DefaultProfile from "../../components/Layout/DefaultProfile";
import { getInitials } from "../../utility/general-utility";
import { isAuth } from "../../utility/helper";
import { toast } from "sonner";
import { getAction, patchAction, postAction, putAction } from "../../services/generalServices";
import { useLocation, useNavigate } from "react-router";
import axiosInstance from "../../utility/axios_interceptor";
import CodeBlockEditor from "../../components/Write/CodeBlockEditor";

type ItemType = "content" | "bullet" | "image" | "code";

interface Item {
    type: ItemType;
    value: string;
    language?: string;
    theme?: string;
    imageUrl?: string;
    imageAlt?: string;
    align?: "start" | "center" | "end";
    expanded?: boolean;
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

export const languages = [
  "JavaScript",  // JavaScript
  "Python",      // Python
  "Java",        // Java
  "CPP",         // C++ (Monaco expects "cpp" but will accept "Cpp")
  "Shell",       // Bash (Monaco uses "shell")
  "HTML",        // HTML
  "CSS",         // CSS
  "Plaintext"    // Plain Text
];

const WriteBlog: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('editid');
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

    const [pendingImages, setPendingImages] = useState<
    { file: File; sectionIndex: number; localPreviewUrl: string }[]
    >([]);


    useEffect(()=>{
        const getBlogDetails = async () =>{
            try{
                const res = await getAction(`/blogs/${id}`);
                console.log(res);
                setSections(res.data.blog.sections);
                setTempBlogHeader(res.data.blog.title);
                setBlogHeader(res.data.blog.title);
                setloading(false); 
            }catch(err){
                console.log(err);
            }finally{
                setloading(false);
            }
        }
        console.log(id)
        if(id){
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
        const localPreviewUrl = URL.createObjectURL(file);

        const newPending = {
            file,
            sectionIndex,
            localPreviewUrl,
        };

        setPendingImages((prev) => [...prev, newPending]);

        const updatedSections = [...sections];

        // ✅ Ensure the section exists
        if (!updatedSections[sectionIndex]) {
            updatedSections[sectionIndex] = {
                items: []
            };
        }

        updatedSections[sectionIndex].items.push({
            type: "image",
            value: "",
            imageUrl: localPreviewUrl,
            imageAlt: "Enter image description...",
            align: "start",
            expanded: false,
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
    const defaultText = type === 'content' ? '' : '';

    const newItem: Item = {
        type,
        value: defaultText,
        ...(type === 'code' && {
        language: 'javascript',
        theme: 'vs-dark',
        }),
    };

    let updatedSections = [...sections];

    if (activeSectionIndex === null || sections.length === 0) {
        const newSection: Section = { items: [newItem] };
        updatedSections.push(newSection);
        setSections(updatedSections);
        setActiveSectionIndex(updatedSections.length - 1);
        return;
    }

    const targetSection = sectionIndex !== undefined ? sectionIndex : activeSectionIndex;

    if (insertAfterIndex !== undefined) {
        updatedSections[targetSection].items.splice(insertAfterIndex + 1, 0, newItem);
        setSections(updatedSections);

        setTimeout(() => {
        onAddFocus?.(insertAfterIndex + 1, targetSection);
        }, 0);
    } else {
        updatedSections[targetSection].items.push(newItem);
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

    async function getImageHash(file: Blob): Promise<string> {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }


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

            if (/[\/\\]/.test(blogHeader)) {
                toast.error('Title cannot contain slashes or backslashes.');
                return;
            }

            if (blogHeader.length > 100) {
                toast.error('Title should be less than 100 characters.');
                return;
            }

            if (sections.length === 0 || sections.every(section => section.items.length === 0)) {
                toast.error('Blog content cannot be empty.');
                return;
            }

            // Step 1: Create blog with temp image URLs
            const data = {
                title: blogHeader,
                author: isAuth().full_name,
                authorId: isAuth()._id,
                sections,
                isPublished: true,
                tags: [],
                coverImage: "",
            };

            const res = await postAction('/blogs/create', data);

            if (res.status === 201) {
                const blogId = res.data._id;
                let updatedSections = [...sections];

                // Step 2: Upload images to Azure using blogId
                for (let secIdx = 0; secIdx < updatedSections.length; secIdx++) {
                    const updatedItems = await Promise.all(
                        updatedSections[secIdx].items.map(async (item) => {
                            if (item.type === "image" && item.imageUrl?.startsWith("blob:")) {
                                const blob = await fetch(item.imageUrl).then(r => r.blob());
                                const hash = await getImageHash(blob);

                                const formData = new FormData();
                                formData.append("image", blob, "blog-image.jpg");
                                formData.append("blogId", blogId); // or `id` in updateBlog
                                formData.append("hash", hash);

                                const uploadRes = await axiosInstance.post('/blogs/upload-image', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });

                                const { imageUrl } = uploadRes.data;
                                return { ...item, imageUrl };
                            }

                            return item;
                        })
                    );

                    updatedSections[secIdx].items = updatedItems;
                }

                // Step 3: Patch the blog with final image URLs
                const patchRes = await patchAction(`/blogs/${blogId}/update-images`, {
                    sections: updatedSections
                });

                if (patchRes.status === 200) {
                    toast.success('Published!!!');
                    localStorage.removeItem('blogDraft');
                    navigate(`/blog/${res.data._id}/${res.data.slug}`);
                } else {
                    toast.error('Blog published, but image update failed.');
                }
            } else {
                toast.error(res.data?.error || 'Failed to publish blog.');
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during publishing.");
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

            if (/[\/\\]/.test(blogHeader)) {
                toast.error('Title cannot contain slashes or backslashes.');
                return;
            }

            if (blogHeader.length > 100) {
                toast.error('Title should be less than 100 characters.');
                return;
            }

            if (sections.length === 0 || sections.every(section => section.items.length === 0)) {
                toast.error('Blog content cannot be empty.');
                return;
            }

            let updatedSections = [...sections];

            // Step 2: Upload any new blob images
            for (let secIdx = 0; secIdx < updatedSections.length; secIdx++) {
                const updatedItems = await Promise.all(
                    updatedSections[secIdx].items.map(async (item) => {
                        if (item.type === "image" && item.imageUrl?.startsWith("blob:")) {
                            const blob = await fetch(item.imageUrl).then(r => r.blob());
                            const hash = await getImageHash(blob);

                            const formData = new FormData();
                            formData.append("image", blob, "blog-image.jpg");
                            formData.append("blogId", id!);
                            formData.append("hash", hash);

                            const uploadRes = await axiosInstance.post('/blogs/upload-image', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });

                            const { imageUrl } = uploadRes.data;
                            return { ...item, imageUrl };
                        }
                        return item;
                    })
                );

                updatedSections[secIdx].items = updatedItems;
            }

            // Step 3: Submit updated blog with final image URLs
            const data = {
                title: blogHeader,
                author: isAuth().full_name,
                sections: updatedSections,
                isPublished: true,
                tags: [],
                coverImage: "",
            };

            const res = await putAction(`/blogs/update/${id}`, data);
            if (res.status === 200) {
                localStorage.removeItem('blogDraft');
                toast.success('Updated!');
                navigate(`/blog/${res.data._id}/${res.data.slug}`);
            } else if (res.status === 400) {
                toast.error(res.data.error);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update blog.");
        }
    };

    console.log(sections);

    return (
        <>
            {!loading && (
                <div className="write__blog__wrapper">
                    <div className="write__blog"> 
                        {
                            isAuth() ? (
                                <div className="actions">
                                    <div className="save__draft glassmorphism-medium gls-box pointer" onClick={saveDraft}>Save Draft</div>
                                    <div className="publish__blog glassmorphism-medium gls-box pointer" onClick={id ? updateBlog : publishBlog}>{id ? "Update" : 'Publish'}</div>
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
                                            className="blog__builder__option glassmorphism-medium pointer"
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
                                        <div className="blog__builder__option glassmorphism-medium pointer">
                                            <label htmlFor={`image-upload-${0}`} style={{cursor: "pointer"}} className="flex items-center gap-1">
                                                <FiImage size={16} />
                                                Image
                                            </label>
                                            <input
                                                id={`image-upload-${0}`}
                                                type="file"
                                                accept="image/*"
                                                style={{display: "none"}}
                                                onChange={(e) => {
                                                    
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleImageUpload(0, e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div
                                            className="blog__builder__option glassmorphism-medium pointer"
                                            onClick={() => addItem("code", 0)}
                                        >
                                            {'</>'} Code Block
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
                                                <div className="blog__builder__option glassmorphism-medium pointer">
                                                    <label htmlFor={`image-upload-${sectionIndex}`} style={{cursor: "pointer"}} className="flex items-center gap-1">
                                                        <FiImage size={16} />
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
                                                </div>
                                                <div
                                                    className="blog__builder__option glassmorphism-medium pointer"
                                                    onClick={() => addItem("code", sectionIndex)}
                                                >
                                                    {'</>'} Code Block
                                                </div>

                                            </div>
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

                                            {item.type === "code" && (
                                                <div className="code-editor-wrapper">
                                                    <div className="code-editor">
                                                        <div className="code-toolbar">
                                                        <select
                                                        value={item.language?.toLowerCase() || 'plaintext'}
                                                        onChange={(e) => {
                                                            const updatedSections = [...sections];
                                                            updatedSections[sectionIndex].items[itemIndex].language = e.target.value.toLowerCase();
                                                            setSections(updatedSections);
                                                        }}
                                                        className="ff-google-n"
                                                        >
                                                        {languages.map((lang) => (
                                                            <option key={lang} value={lang.toLowerCase()}>
                                                            {lang}
                                                            </option>
                                                        ))}
                                                        </select>


                                                        <select
                                                            value={item.theme || 'vs-dark'}
                                                            onChange={(e) => {
                                                            const updatedSections = [...sections];
                                                            updatedSections[sectionIndex].items[itemIndex].theme = e.target.value;
                                                            setSections(updatedSections);
                                                            }}
                                                            className="ff-google-n"
                                                        >
                                                            {['vs-dark', 'vs-light', 'hc-black'].map((theme) => (
                                                            <option key={theme} value={theme}>
                                                                {theme}
                                                            </option>
                                                            ))}
                                                        </select>
                                                        </div>

                                                        <CodeBlockEditor
                                                            value={item.value}
                                                            language={item.language?.toLowerCase() || 'plaintext'}
                                                            onChange={(newValue) => updateItem(sectionIndex, itemIndex, newValue)}
                                                            theme={item.theme || 'vs-dark'}
                                                            editing={true}
                                                        />

                                                    </div>
                                                    
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

                                                    <div className="content__actions">
                                                        <FiTrash
                                                            className="delete__icon pointer"
                                                            onClick={() => {
                                                                const updatedSections = [...sections];
                                                                updatedSections[sectionIndex].items.splice(itemIndex, 1);
                                                                setSections(updatedSections);
                                                            }}
                                                        />
                                                        {["start", "center", "end"].map((alignOption) => (
                                                            <div
                                                                key={alignOption}
                                                                className="action pointer"
                                                                onClick={() => {
                                                                    const updatedSections = [...sections];
                                                                    updatedSections[sectionIndex].items[itemIndex].align = alignOption as "start" | "center" | "end";
                                                                    setSections(updatedSections);
                                                                }}
                                                            >
                                                                <div 
                                                                    className={`action__label ${item.align === alignOption ? 'ff-google-b':'ff-google-n'}`}
                                                                    style={item.align !== alignOption ? {opacity:"0.6"} : {}}
                                                                >
                                                                    {alignOption[0].toUpperCase() + alignOption.slice(1)}
                                                                </div>
                                                                <img src={`/icons/write/${alignOption}.svg`} alt={alignOption} />
                                                            </div>
                                                        ))}

                                                        <div
                                                            className="action pointer"
                                                            onClick={() => {
                                                                const updatedSections = [...sections];
                                                                const currentItem = updatedSections[sectionIndex].items[itemIndex];
                                                                currentItem.expanded = !currentItem.expanded;
                                                                setSections(updatedSections);
                                                            }}
                                                            style={!item.expanded ? {opacity:"0.6"} : {}}
                                                        >
                                                            <div 
                                                                className="action__label pointer"
                                                            >
                                                                Expand
                                                            </div>
                                                            <img src="/icons/write/expand.svg" alt="Expand" />
                                                        </div>
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
            )}
        </>
    );
};

export default WriteBlog;
