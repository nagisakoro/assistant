class RequestBodyService {
  static getAccountCases(caseAccountId) {
    return {
      rootSchemaName: "Case",
      operationType: 0,
      filters: {
        items: {
          "141a36c0-bb01-4f92-970f-e0c694e9bf4b": {
            items: {
              masterRecordFilter: {
                filterType: 1,
                comparisonType: 3,
                isEnabled: true,
                trimDateTimeParameterToDate: false,
                leftExpression: { expressionType: 0, columnPath: "Account" },
                rightExpression: { expressionType: 2, parameter: { dataValueType: 1, value: caseAccountId } },
              },
            },
            logicalOperation: 0,
            isEnabled: true,
            filterType: 6,
          },
        },
        logicalOperation: 0,
        isEnabled: true,
        filterType: 6,
      },
      columns: {
        items: {
          Id: { caption: "", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Id" } },
          Number: { caption: "", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Number" } },
          CreatedOn: { caption: "Дата создания", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "CreatedOn" } },
          StnAcc: { caption: "Лицевой счет", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "StnAcc" } },
          ServiceItem: { caption: "Сервис", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "ServiceItem" } },
          ServiceCategory: {
            caption: "Категория сервиса",
            orderDirection: 0,
            orderPosition: -1,
            isVisible: true,
            expression: { expressionType: 0, columnPath: "ServiceCategory" },
          },
          Subject: { caption: "Тема", orderDirection: 2, orderPosition: 1, isVisible: true, expression: { expressionType: 0, columnPath: "Subject" } },
          Symptoms: { caption: "Описание", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Symptoms" } },
          Status: { caption: "Состояние", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Status" } },
          Owner: { caption: "Ответственный", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Owner" } },
          CreatedBy: { caption: "Создал", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "CreatedBy" } },
          Group: { caption: "Группа ответственных", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Group" } },
          Origin: { caption: "Происхождение", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Origin" } },
          Category: { caption: "Категория", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Category" } },
          EntryPointsCount: {
            caption: "",
            orderDirection: 0,
            orderPosition: -1,
            isVisible: true,
            expression: {
              expressionType: 3,
              aggregationType: 1,
              columnPath: "[EntryPoint:EntityId].Id",
              subFilters: {
                items: {
                  "c8594616-981f-4612-8f89-576b9453ec6a": {
                    filterType: 1,
                    comparisonType: 3,
                    isEnabled: true,
                    trimDateTimeParameterToDate: false,
                    leftExpression: { expressionType: 0, columnPath: "IsActive" },
                    rightExpression: { expressionType: 2, parameter: { dataValueType: 1, value: true } },
                  },
                },
                logicalOperation: 0,
                isEnabled: true,
                filterType: 6,
              },
            },
          },
        },
      },
      isDistinct: false,
      rowCount: 100,
      rowsOffset: 0,
      isPageable: true,
      allColumns: false,
      useLocalization: true,
      useRecordDeactivation: false,
      serverESQCacheParameters: { cacheLevel: 0, cacheGroup: "", cacheItemName: "" },
      queryOptimize: false,
      useMetrics: false,
      querySource: 0,
      ignoreDisplayValues: false,
      conditionalValues: null,
      isHierarchical: false,
    };
  }

  static getAccountLids(caseAccountId) {
    return {
      rootSchemaName: "Lead",
      operationType: 0,
      filters: {
        items: {
          "4ca4c744-efef-446f-9fa8-706c9ee9301d": {
            items: {
              masterRecordFilter: {
                filterType: 1,
                comparisonType: 3,
                isEnabled: true,
                trimDateTimeParameterToDate: false,
                leftExpression: { expressionType: 0, columnPath: "QualifiedAccount" },
                rightExpression: { expressionType: 2, parameter: { dataValueType: 1, value: caseAccountId } },
              },
            },
            logicalOperation: 0,
            isEnabled: true,
            filterType: 6,
          },
        },
        logicalOperation: 0,
        isEnabled: true,
        filterType: 6,
      },
      columns: {
        items: {
          Id: { caption: "", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Id" } },
          LeadName: { caption: "", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "LeadName" } },
          "QualifyStatus.StageNumber": {
            caption: "",
            orderDirection: 0,
            orderPosition: -1,
            isVisible: true,
            expression: { expressionType: 0, columnPath: "QualifyStatus.StageNumber" },
          },
          CreatedOn: { caption: "Дата создания", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "CreatedOn" } },
          LeadType: { caption: "Тип потребности", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "LeadType" } },
          Account: { caption: "Название контрагента", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Account" } },
          QualifyStatus: { caption: "Стадия лида", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "QualifyStatus" } },
          CreatedBy: { caption: "Создал", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "CreatedBy" } },
          Owner: { caption: "Ответственный", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Owner" } },
          ModifiedOn: { caption: "Дата изменения", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "ModifiedOn" } },
          Notes: { caption: "Заметки", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Notes" } },
          EntryPointsCount: {
            caption: "",
            orderDirection: 0,
            orderPosition: -1,
            isVisible: true,
            expression: {
              expressionType: 3,
              aggregationType: 1,
              columnPath: "[EntryPoint:EntityId].Id",
              subFilters: {
                items: {
                  "a10bbe7e-401f-45ac-b405-037d9d07f676": {
                    filterType: 1,
                    comparisonType: 3,
                    isEnabled: true,
                    trimDateTimeParameterToDate: false,
                    leftExpression: { expressionType: 0, columnPath: "IsActive" },
                    rightExpression: { expressionType: 2, parameter: { dataValueType: 1, value: true } },
                  },
                },
                logicalOperation: 0,
                isEnabled: true,
                filterType: 6,
              },
            },
          },
        },
      },
      isDistinct: false,
      rowCount: 100,
      rowsOffset: 0,
      isPageable: true,
      allColumns: false,
      useLocalization: true,
      useRecordDeactivation: false,
      serverESQCacheParameters: { cacheLevel: 0, cacheGroup: "", cacheItemName: "" },
      queryOptimize: false,
      useMetrics: false,
      querySource: 0,
      ignoreDisplayValues: false,
      conditionalValues: null,
      isHierarchical: false,
    };
  }

  static getAccountSale(caseAccountId) {
    return {
      rootSchemaName: "Opportunity",
      operationType: 0,
      filters: {
        items: {
          "4d53d861-c9a5-4d80-945e-bf7cc2cabe20": {
            items: {
              masterRecordFilter: {
                filterType: 1,
                comparisonType: 3,
                isEnabled: true,
                trimDateTimeParameterToDate: false,
                leftExpression: { expressionType: 0, columnPath: "Account" },
                rightExpression: { expressionType: 2, parameter: { dataValueType: 1, value: caseAccountId } },
              },
            },
            logicalOperation: 0,
            isEnabled: true,
            filterType: 6,
          },
        },
        logicalOperation: 0,
        isEnabled: true,
        filterType: 6,
      },
      columns: {
        items: {
          Id: { caption: "", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Id" } },
          Title: { caption: "", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Title" } },
          ModifiedOn: { caption: "Дата изменения", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "ModifiedOn" } },
          CreatedOn: { caption: "Дата создания", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "CreatedOn" } },
          LeadType: { caption: "Тип потребности", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "LeadType" } },
          Stage: { caption: "Стадия", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Stage" } },
          CreatedBy: { caption: "Создал", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "CreatedBy" } },
          Owner: { caption: "Ответственный", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Owner" } },
          Notes: { caption: "Заметки", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Notes" } },
          DueDate: { caption: "Дата закрытия", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "DueDate" } },
          Type: { caption: "", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Type" } },
          EntryPointsCount: {
            caption: "",
            orderDirection: 0,
            orderPosition: -1,
            isVisible: true,
            expression: {
              expressionType: 3,
              aggregationType: 1,
              columnPath: "[EntryPoint:EntityId].Id",
              subFilters: {
                items: {
                  "9d511612-bd54-493d-b2a4-05cf91f7fe43": {
                    filterType: 1,
                    comparisonType: 3,
                    isEnabled: true,
                    trimDateTimeParameterToDate: false,
                    leftExpression: { expressionType: 0, columnPath: "IsActive" },
                    rightExpression: { expressionType: 2, parameter: { dataValueType: 1, value: true } },
                  },
                },
                logicalOperation: 0,
                isEnabled: true,
                filterType: 6,
              },
            },
          },
        },
      },
      isDistinct: false,
      rowCount: 100,
      rowsOffset: 0,
      isPageable: true,
      allColumns: false,
      useLocalization: true,
      useRecordDeactivation: false,
      serverESQCacheParameters: { cacheLevel: 0, cacheGroup: "", cacheItemName: "" },
      queryOptimize: false,
      useMetrics: false,
      querySource: 0,
      ignoreDisplayValues: false,
      conditionalValues: null,
      isHierarchical: false,
    };
  }

  static getStatus(caseId) {
    return {
      rootSchemaName: "CaseLifecycle",
      operationType: 0,
      filters: {
        items: {
          "76ea03dc-a6eb-4dc6-af0b-f76f6fe90cd7": {
            items: {
              masterRecordFilter: {
                filterType: 1,
                comparisonType: 3,
                isEnabled: true,
                trimDateTimeParameterToDate: false,
                leftExpression: { expressionType: 0, columnPath: "Case" },
                rightExpression: { expressionType: 2, parameter: { dataValueType: 1, value: caseId } },
              },
            },
            logicalOperation: 0,
            isEnabled: true,
            filterType: 6,
          },
        },
        logicalOperation: 0,
        isEnabled: true,
        filterType: 6,
      },
      columns: {
        items: {
          Id: { caption: "", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Id" } },
          StartDate: { caption: "Дата начала", orderDirection: 1, orderPosition: 1, isVisible: true, expression: { expressionType: 0, columnPath: "StartDate" } },
          EndDate: { caption: "Дата завершения", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "EndDate" } },
          Status: { caption: "Состояние", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Status" } },
          Priority: { caption: "Приоритет", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Priority" } },
          Owner: { caption: "Ответственный", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Owner" } },
          Group: { caption: "Группа ответственных", orderDirection: 0, orderPosition: -1, isVisible: true, expression: { expressionType: 0, columnPath: "Group" } },
          EntryPointsCount: {
            caption: "",
            orderDirection: 0,
            orderPosition: -1,
            isVisible: true,
            expression: {
              expressionType: 3,
              aggregationType: 1,
              columnPath: "[EntryPoint:EntityId].Id",
              subFilters: {
                items: {
                  "7e6de9fa-5614-43d3-b9fe-e155625a59f2": {
                    filterType: 1,
                    comparisonType: 3,
                    isEnabled: true,
                    trimDateTimeParameterToDate: false,
                    leftExpression: { expressionType: 0, columnPath: "IsActive" },
                    rightExpression: { expressionType: 2, parameter: { dataValueType: 1, value: true } },
                  },
                },
                logicalOperation: 0,
                isEnabled: true,
                filterType: 6,
              },
            },
          },
        },
      },
      isDistinct: false,
      rowCount: 10,
      rowsOffset: 0,
      isPageable: true,
      allColumns: false,
      useLocalization: true,
      useRecordDeactivation: false,
      serverESQCacheParameters: { cacheLevel: 0, cacheGroup: "", cacheItemName: "" },
      queryOptimize: false,
      useMetrics: false,
      querySource: 0,
      ignoreDisplayValues: false,
      conditionalValues: null,
      isHierarchical: false,
    };
  }
}
