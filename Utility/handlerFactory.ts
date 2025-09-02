import { NextFunction } from "express";
import { IBaseRequest } from "../Interfaces/core_interfaces";

// utils/handlerFactory.js or similar
export const getAll = (Model:any) => async (req:any, res:any) => {
  try {
    const docs = await Model.find();
    res.status(200).json({
      status: "success",
      results: docs.length,
      data: docs,
    });
  } catch (err:any) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// import AppError from "./appError";
// import { Request, Response, NextFunction } from "express";
// import { Model } from "mongoose";
// import APIFeatures from "./apiFeatures";
// import { IBaseRequest } from "../interfaces/core_interfaces";

// export interface IFilter {
//   _id?: string;
// }

// export const getOne = (Model: any, popOptions?: string | null) =>
//   catchAsync(async (req: IBaseRequest, res: Response, next: NextFunction) => {
//     let filter: IFilter = { _id: req.params.id };
//     let query = Model.find(filter);
//     if (popOptions) query = query.populate(popOptions);
//     const doc = await query;

//     if (!doc) {
//       return next(new AppError("No document found with that ID", 404));
//     }
//     res.status(200).json({
//       status: "success",
//       data: doc,
//     });
//   });

// export const getAll = (Model: Model<any>) =>
//   catchAsync(async (req: IBaseRequest, res: Response, next: NextFunction) => {
//     let filter: IFilter = {};

//     const features = new APIFeatures(Model.find(filter), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     // const doc = await features.query.explain();
//     const doc = await features.query;

//     // SEND RESPONSE
//     res.status(200).json({
//       status: "success",
//       results: doc.length,
//       data: doc,
//     });
//   });

// export const deleteOne = (Model: any) =>
//   catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const doc = await Model.findByIdAndDelete(req.params.id);

//     if (!doc) {
//       return next(new AppError("No document found with that ID", 404));
//     }

//     res.status(204).json({
//       status: "success",
//       data: null,
//     });
//   });

// export const createOne =
//   (Model: Model<any>) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const doc = await Model.create(req.body);

//       res.status(201).json({
//         status: "success",
//         data: {
//           data: doc,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };
