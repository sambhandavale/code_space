import { Query } from "mongoose";

interface IAPIFeatures {
    query: Query<any, any>;
    queryString: { [index: string]: string };
    filter(): APIFeatures;
  }

class APIFeatures implements IAPIFeatures {
  constructor(
    query: Query<any, any>,
    queryString: { [index: string]: string },
  ) {
    this.query = query;
    this.queryString = queryString;
  }
  query: Query<any, any, {}, any>;
  queryString: { [index: string]: string };

  filter() {
    const queryObj: { [index: string]: any } = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    if (queryObj.rating === "valid") {
      queryObj.rating = { $exists: true, $ne: null };
    }

    // 1B) Advanced filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // queryObj = JSON.parse(queryStr);

    this.query = this.query.find(queryObj);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // If `sort` is provided in the query string, use that
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort if `sort` is not provided: By `rating` in descending order
      this.query = this.query.sort("-rating");
    }
    return this;
  }  
  

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
export default APIFeatures;
