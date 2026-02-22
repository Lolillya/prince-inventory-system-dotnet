using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models.Unit;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seeders
{
    public class SeedUnitOfMeasure
    {

        public static void SeedUnitOfMeasureData(ModelBuilder modelBuilder)
        {

            var units = new List<UnitOfMeasure>
            {

                new UnitOfMeasure
                {
                    uom_ID = 1,
                    uom_Name = "PIECE"
                },

                new UnitOfMeasure
                {
                    uom_ID = 2,
                    uom_Name = "PAD"
                },

                new UnitOfMeasure
                {
                    uom_ID = 3,
                    uom_Name = "SET"
                },

                new UnitOfMeasure
                {
                    uom_ID = 4,
                    uom_Name = "BOX"
                },

                new UnitOfMeasure
                {
                    uom_ID = 5,
                    uom_Name = "BUNDLE"
                },

                new UnitOfMeasure
                {
                    uom_ID = 6,
                    uom_Name = "ROLL"
                },

                new UnitOfMeasure
                {
                    uom_ID = 7,
                    uom_Name = "GALLON"
                },

                new UnitOfMeasure
                {
                    uom_ID = 8,
                    uom_Name = "PACK"
                },

                new UnitOfMeasure
                {
                    uom_ID = 9,
                    uom_Name = "TUBE"
                },

                new UnitOfMeasure
                {
                    uom_ID = 10,
                    uom_Name = "CARTON"
                },

                new UnitOfMeasure
                {
                    uom_ID = 11,
                    uom_Name = "CASE"
                },

                new UnitOfMeasure
                {
                    uom_ID = 12,
                    uom_Name = "REAM"
                },
                new UnitOfMeasure
                {
                    uom_ID = 13,
                    uom_Name = "BOTTLE"
                }
            };
            modelBuilder.Entity<UnitOfMeasure>().HasData(units);
        }
    }
}
